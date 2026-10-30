const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/enquiry.js'),'utf8');
function fixture({endpoint='',fetchResult={ok:true,success:true},reject=false}={}){
 const elements=new Map();
 const element=(id)=>{if(!elements.has(id))elements.set(id,{id,name:id,value:'',textContent:'',innerHTML:'',disabled:false,dataset:{},attrs:{},events:{},validity:{typeMismatch:false},addEventListener(n,f){this.events[n]=f},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},removeAttribute(k){delete this.attrs[k]},focus(){this.focused=true}});return elements.get(id)};
 const fields=['name','email','phone','message'].map(element),form=element('enquiry-form');form.querySelectorAll=()=>fields;form.reset=()=>fields.forEach(f=>f.value='');
 let calls=0,resolveFetch;const fetchPromise=new Promise(resolve=>resolveFetch=resolve);
 const sandbox={document:{querySelector:s=>element(s.slice(1))},window:{STUDIO_CONFIG:{enquiryEndpoint:endpoint}},location:{origin:'http://localhost'},navigator:{clipboard:{writeText:async text=>{sandbox.copied=text}}},fetch:async(url,options)=>{calls++;sandbox.request={url,options};if(reject)throw new Error('Network failure');await fetchPromise;return {ok:fetchResult.ok,json:async()=>({success:fetchResult.success})}},URL,AbortController,setTimeout,clearTimeout,Object,Boolean,String};
 vm.runInNewContext(source,sandbox);
 const fill=(values={name:'Preview Tester',email:'preview@example.com',phone:'+91 90000 00000',message:'Local automated test.'})=>{for(const f of fields)f.value=values[f.name]??''};
 return {fields,form,element,sandbox,fill,get calls(){return calls},resolveFetch,submit:()=>form.events.submit({preventDefault(){}})};
}
test('exactly four fields reject blank and whitespace values',async()=>{const f=fixture();f.fill({name:' ',email:' ',phone:' ',message:' '});await f.submit();assert.equal(f.calls,0);for(const input of f.fields)assert.equal(input.attrs['aria-invalid'],'true');assert.equal(f.fields[0].focused,true)});
test('email and phone validation reject malformed values',async()=>{const f=fixture();f.fill({name:'A',email:'bad-email',phone:'abc',message:'A room'});await f.submit();assert.equal(f.element('email').attrs['aria-invalid'],'true');assert.equal(f.element('phone').attrs['aria-invalid'],'true');assert.equal(f.calls,0)});
test('unconfigured form never reports delivery or sends data',async()=>{const f=fixture();f.fill();await f.submit();assert.match(f.element('form-status').textContent,/not been sent/);assert.equal(f.calls,0);assert.equal(f.element('message').value,'Local automated test.')});
test('only an explicit server acknowledgement shows success',async()=>{const f=fixture({endpoint:'/api/enquiries'});f.fill();const request=f.submit();assert.equal(f.element('submit-enquiry').disabled,true);assert.equal(f.element('form-status').dataset.state,'loading');f.resolveFetch();await request;assert.equal(f.calls,1);assert.equal(f.sandbox.request.options.method,'POST');assert.deepEqual(Object.keys(JSON.parse(f.sandbox.request.options.body)),['name','email','phone','message']);assert.equal(f.element('form-status').dataset.state,'success');assert.equal(f.element('message').value,'');assert.equal(f.element('submit-enquiry').disabled,false)});
test('HTTP failure preserves details and shows no false success',async()=>{const f=fixture({endpoint:'/api/enquiries',fetchResult:{ok:false,success:true}});f.fill();f.resolveFetch();await f.submit();assert.equal(f.element('form-status').dataset.state,'error');assert.equal(f.element('message').value,'Local automated test.')});
test('unacknowledged response and network failure are errors',async()=>{for(const opts of [{fetchResult:{ok:true,success:false}},{reject:true}]){const f=fixture({endpoint:'/api/enquiries',...opts});f.fill();f.resolveFetch();await f.submit();assert.equal(f.element('form-status').dataset.state,'error');assert.equal(f.element('submit-enquiry').disabled,false)}});
test('copy enquiry is local and does not claim it was submitted',async()=>{const f=fixture();f.fill();await f.element('copy-enquiry').events.click();assert.match(f.sandbox.copied,/Interior design enquiry/);assert.match(f.element('form-status').textContent,/Nothing has been sent/);assert.equal(f.calls,0)});
