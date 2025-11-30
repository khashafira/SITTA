Vue.component('app-modal', {
  template: `
    <div v-show="visible" class="modal-backdrop" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;">
      <div class="card" style="width:360px;position:relative;">
        <h3>{{title}}</h3>
        <p v-html="message"></p>
        <div style="text-align:right;margin-top:12px;">
          <button class="btn" @click="confirm">Yes</button>
          <button class="btn" style="background:#ddd;color:#111;margin-left:8px;" @click="close">Cancel</button>
        </div>
      </div>
    </div>
  `,
  data(){ return { 
    visible:false, 
    title:'Konfirmasi', 
    message:'', resolve:null }; },
  methods:{
    open(opts={title:'Konfirmasi', message:''}){
      this.title = opts.title; this.message = opts.message; this.visible = true;
      return new Promise((res)=>{ this.resolve = res; });
    },
    close(){ this.visible = false; if(this.resolve) this.resolve(false); },
    confirm(){ this.visible = false; if(this.resolve) this.resolve(true); }
  }
});
