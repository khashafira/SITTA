Vue.component('order-form', {
  props:['paketList','pengirimanList'],
  template: `
    <div class="card">
      <h3>Form Pemesanan</h3>
      <div class="form-row">
        <select v-model="form.paket">
          <option value="">Pilih paket</option>
          <option v-for="p in paketList" :value="p.kode">{{p.kode}} - {{p.nama}}</option>
        </select>
        <select v-model="form.pengiriman">
          <option v-for="g in pengirimanList" :value="g.kode">{{g.nama}}</option>
        </select>
      </div>

      <div v-if="selectedPaket" style="margin-top:8px">
        <div class="small">Isi paket:</div>
        <ul>
          <li v-for="c in selectedPaket.isi" :key="c">{{c}}</li>
        </ul>
        <div class="small">Total: <strong v-text="formatCurrency(selectedPaket.harga)"></strong></div>
      </div>

      <div style="margin-top:8px">
        <input class="input" placeholder="NIM" v-model="form.nim" />
        <input class="input" placeholder="Nama" v-model="form.nama" @keyup.enter="submitOrder" />
      </div>
      <div style="text-align:right;margin-top:8px">
        <button class="btn" @click="submitOrder">Submit</button>
      </div>
      <div v-if="error" class="small" style="color:#c43030">{{error}}</div>
    </div>
  `,
  data(){ return { form:{paket:'', pengiriman:'REG', nim:'', nama:''}, error:'' }; },
  computed:{
    selectedPaket(){ return this.paketList.find(p=>p.kode===this.form.paket); }
  },
  methods:{
    formatCurrency(v){ if(!v) return '-'; return 'Rp ' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); },
    submitOrder(){
      if(!this.form.paket || !this.form.nim || !this.form.nama){ this.error = 'Lengkapi data'; return; }
      this.error = '';
      const payload = { paket:this.form.paket, pengiriman:this.form.pengiriman, nim:this.form.nim, nama:this.form.nama, tanggal: new Date().toISOString() };
      this.$emit('new-order', payload);
      // reset
      this.form = {paket:'', pengiriman:'REG', nim:'', nama:''};
      alert('Order submitted (simulasi).');
    }
  }
});
