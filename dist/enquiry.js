(() => {
const form=document.querySelector('#enquiry-form');
const formStatus=document.querySelector('#form-status');
const submitButton=document.querySelector('#submit-enquiry');
const config=window.STUDIO_CONFIG||{};
const supabase=Boolean(config.supabaseUrl&&config.supabasePublishableKey);
const endpoint=supabase?config.supabaseUrl+'/rest/v1/rpc/submit_website_enquiry':(config.enquiryEndpoint||'').trim();
const fields=[...form.querySelectorAll('input,textarea')];
const phone=document.querySelector('#phone');
let requestType='enquiry',pendingSubmission=null,toastTimer;
function showConfirmation(){
 const toast=document.querySelector('#submission-toast');
 document.querySelector('#submission-toast-text').textContent='Your '+(requestType==='consultation'?'consultation request':'enquiry')+' has been saved. We’ll be in touch.';
 clearTimeout(toastTimer);toast.hidden=false;
 toastTimer=setTimeout(()=>{toast.hidden=true;},4000);
}
document.querySelectorAll('[data-request-type]').forEach(link=>link.addEventListener('click',()=>{
 requestType=link.dataset.requestType;
 document.querySelector('#request-kind').textContent=requestType==='consultation'?'Consultation request':'General enquiry';
}));
if(endpoint)document.querySelector('#form-note').textContent='All four fields are required. Your details will be securely saved so the studio can respond to your request.';
function validEmail(value){
 if(value.length>254)return false;
 const parts=value.split('@');
 return parts.length===2&&parts[0].length<=64&&/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i.test(parts[0])&&/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(parts[1]);
}
function fieldError(input,error){
 document.querySelector('#'+input.id+'-error').textContent=error;
 input.setAttribute('aria-invalid',String(Boolean(error)));
}
function validateField(input){
 const value=input.value.trim();let error='';
 if(!value)error=({name:'Please enter your name.',email:'Please enter your email address.',phone:'Please enter your 10-digit Indian mobile number.',message:'Please tell us a little about your project.'})[input.name];
 else if(input.name==='email'&&(input.validity.typeMismatch||!validEmail(value)))error='Please enter a valid email address, such as name@example.com.';
 else if(input.name==='phone'&&!/^[6-9][0-9]{9}$/.test(value))error='Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9. Do not include +91.';
 else if(input.name==='name'&&value.length>120)error='Please use no more than 120 characters.';
 else if(input.name==='message'&&value.length>5000)error='Please use no more than 5,000 characters.';
 fieldError(input,error);return !error;
}
phone.addEventListener('beforeinput',e=>{if(e.data&&/[^0-9]/.test(e.data))e.preventDefault();});
phone.addEventListener('paste',e=>{
 const value=e.clipboardData?.getData('text')||'';
 const selected=(phone.selectionEnd||0)-(phone.selectionStart||0);
 if(!/^[0-9]+$/.test(value)||phone.value.length-selected+value.length>10){
  e.preventDefault();fieldError(phone,'Enter only your 10-digit mobile number, without spaces or +91.');
 }
});
fields.forEach(field=>{
 field.addEventListener('blur',()=>validateField(field));
 field.addEventListener('input',()=>{
  if(field===phone)field.value=field.value.replace(/[^0-9]/g,'').slice(0,10);
  if(field.getAttribute('aria-invalid')==='true')validateField(field);
  formStatus.textContent='';
 });
});
function validateForm(){const results=fields.map(validateField);const invalid=fields.find(f=>f.getAttribute('aria-invalid')==='true');if(invalid)invalid.focus();return results.every(Boolean);}
function setStatus(text,state){formStatus.textContent=text;formStatus.dataset.state=state;}
function enquiryData(){const data=Object.fromEntries(fields.map(f=>[f.name,f.value.trim()]));data.phone='+91'+data.phone;return data;}
form.addEventListener('submit',async e=>{
 e.preventDefault();if(submitButton.disabled)return;
 if(!validateForm()){setStatus('Please check the highlighted fields.','error');return;}
 if(!endpoint){setStatus('Your enquiry has not been sent. Online submissions are not connected yet. You can use “Copy enquiry” to keep your details.','error');return;}
 let url;try{url=new URL(endpoint,location.origin);if(url.protocol!=='https:'&&url.origin!==location.origin)throw new Error('Invalid endpoint');}catch{setStatus('Online submissions are unavailable. Your enquiry has not been sent.','error');return;}
 submitButton.disabled=true;submitButton.textContent='Sending enquiry…';form.setAttribute('aria-busy','true');setStatus('Sending your enquiry…','loading');
 const abort=new AbortController();const timer=setTimeout(()=>abort.abort(),15000);
 try{
  const data=enquiryData();const signature=JSON.stringify({...data,requestType});
  if(!pendingSubmission||pendingSubmission.signature!==signature)pendingSubmission={signature,id:crypto.randomUUID()};
  const headers={'Content-Type':'application/json','Accept':'application/json'};if(supabase)headers.apikey=config.supabasePublishableKey;
  const payload=supabase?{p_id:pendingSubmission.id,p_name:data.name,p_email:data.email,p_phone:data.phone,p_message:data.message,p_request_type:requestType}:data;
  const response=await fetch(url.href,{method:'POST',headers,body:JSON.stringify(payload),signal:abort.signal,credentials:'omit'});const result=await response.json();
  if(result.errors&&typeof result.errors==='object'){
   let first;
   for(const field of fields){const error=result.errors[field.name];if(typeof error==='string'){fieldError(field,error);first=first||field;}}
   if(first){first.focus();setStatus('Please check the highlighted fields. Your request has not been saved.','error');return;}
  }
  if(!response.ok||result.success!==true)throw new Error('Enquiry was not accepted');
  pendingSubmission=null;showConfirmation();form.reset();fields.forEach(f=>{f.removeAttribute('aria-invalid');document.querySelector('#'+f.id+'-error').textContent='';});
  setStatus('Thank you. Your request has been saved. The studio can now follow up with you.','success');
 }catch(error){setStatus(error.name==='AbortError'?'The request timed out. Delivery could not be confirmed. Please check before trying again.':'We couldn’t confirm delivery. Your details are still here; please try again or copy your enquiry.','error');}
 finally{clearTimeout(timer);submitButton.disabled=false;submitButton.innerHTML='Submit Enquiry <span aria-hidden="true">↗</span>';form.removeAttribute('aria-busy');}
});
document.querySelector('#copy-enquiry').addEventListener('click',async()=>{
 if(!validateForm())return;const data=enquiryData();const text=`Interior design enquiry — Ashtavinayak Design\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n\n${data.message}`;
 try{await navigator.clipboard.writeText(text);setStatus('Enquiry copied. Nothing has been sent to the studio.','info');}catch{setStatus('Clipboard access is unavailable. Please select and copy your details manually. Nothing has been sent.','error');}
});
})();
