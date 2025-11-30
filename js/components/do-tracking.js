Vue.component('do-tracking', {
  props:['tracking','upbjjList','paketList'],
  template: `
    <div class="card">
      <div class="form-row">
        <input class="input" placeholder="Cari Nomor DO atau NIM..." v-model="q" @keyup.enter="search" @keyup.esc="clear" />
        <button class="btn" @click="search">Cari</button>
        <button class="btn" style="background:#ddd;color:#111" @click="clear">Reset</button>
        <div style="margin-left:auto">
          <button class="btn" @click="showAdd = !showAdd">{{showAdd?'Tutup':'Tambah DO'}}</button>
        </div>
      </div>

      <div v-show="showAdd" class="card">
        <div class="form-row">
          <input class="input" v-model="form.nim" placeholder="NIM" />
          <input class="input" v-model="form.nama" placeholder="Nama" />
          <select v-model="form.paket">
            <option v-for="p in paketList" :value="p.kode" :key="p.kode">{{p.kode}} - {{p.nama}}</option>
          </select>
          <select v-model="form.ekspedisi">
            <option v-for="e in upbjjList" :value="e" v-if="false"></option> <!-- placeholder -->
          </select>
        </div>

        <div style="margin-top:8px">
          <label>
            Pengiriman:
            <select v-model="form.pengiriman">
              <option v-for="p in $root.data.pengirimanList" :value="p.kode" :key="p.kode">{{p.nama}}</option>
            </select>
          </label>
          <label style="margin-left:12px">
            Tanggal Kirim:
            <input type="date" v-model="form.tanggalKirim" />
          </label>
        </div>

        <div style="margin-top:8px">
          <button class="btn" @click="addDO">Simpan DO</button>
          <span class="small" style="margin-left:8px">Total: <strong v-text="formatCurrency(selectedPaketPrice)"></strong></span>
        </div>
      </div>

      <div style="margin-top:12px">
        <div v-for="(entry, idx) in searchResult" :key="idx" class="card">
          <h4>{{entryKey(entry)}}</h4>
          <div class="small">NIM: {{entry.nim}} | Nama: {{entry.nama}} | Ekspedisi: {{entry.ekspedisi}} | Tanggal: {{formatDate(entry.tanggalKirim)}}</div>
          <div style="margin-top:8px">
            <div v-for="(p,i) in entry.perjalanan" :key="i" class="small">- {{p.waktu}} : {{p.keterangan}}</div>
          </div>
          <div style="margin-top:8px">
            <input class="input" v-model="newProgress" placeholder="Tambah keterangan..." @keyup.enter="addProgress(entryKey(entry))"/>
            <button class="btn" @click="addProgress(entryKey(entry))">Tambah Progress</button>
          </div>
        </div>
        <div v-if="searchResult.length===0" class="small">Tidak ada hasil</div>
      </div>
    </div>
  `,
  data(){ return {
    q:'', showAdd:false,
    form:{nim:'', nama:'', paket:'', pengiriman:'REG', tanggalKirim: this.todayDate()},
    newProgress:''
  }; },
  computed:{
    searchResult(){
  if(!this.q) return this.tracking.map(obj => this.firstObj(obj));

  const q = this.q.toLowerCase();

  return this.tracking
    .map(obj => this.firstObj(obj))
    .filter(entry => {
      const key = entry.key.toLowerCase();   
      const nim = (entry.nim || '').toLowerCase();
      const nama = (entry.nama || '').toLowerCase();

      return key.includes(q) || nim.includes(q) || nama.includes(q);
    });
}
  },
  methods:{
    firstObj(obj){ return Object.assign({ key: Object.keys(obj)[0] }, obj[Object.keys(obj)[0]]); },
    entryKey(e){
      return e.key || (Object.keys(e)[0]||'');
    },
    search(){ },
    clear(){ this.q=''; },
    todayDate(){
      const d = new Date(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0');
      return `${d.getFullYear()}-${mm}-${dd}`;
    },
    formatDate(v){
      if(!v) return '-';
      const dt = new Date(v);
      const opts = { year:'numeric', month:'long', day:'numeric' };
      return dt.toLocaleDateString('id-ID', opts);
    },
    formatCurrency(v){ if(!v) return '-'; return 'Rp ' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); },
    addDO(){
      // generate DO number
      const year = new Date().getFullYear();
      const existing = this.tracking.map(o=> Object.keys(o)[0]).filter(k=>k && k.includes('DO'+year));
      const seq = existing.length + 1;
      const code = `DO${year}-${String(seq).padStart(4,'0')}`;
      const paket = this.$root.data.paket.find(p=>p.kode===this.form.paket);
      const total = paket ? paket.harga : 0;
      const obj = {};
      obj[code] = { nim:this.form.nim, nama:this.form.nama, status:'Dalam Perjalanan', ekspedisi:this.form.pengiriman, tanggalKirim:this.form.tanggalKirim, paket: this.form.paket, total: total, perjalanan: [{ waktu: this.now(), keterangan: 'DO dibuat' }] };
      this.tracking.push(obj);
      this.$emit('update-tracking', this.tracking);
      // reset
      this.showAdd = false;
      this.form = {nim:'', nama:'', paket:'', pengiriman:'REG', tanggalKirim:this.todayDate()};
    },
    now(){ const d=new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + ' ' + d.toTimeString().split(' ')[0]; },
    addProgress(code){
      const idx = this.tracking.findIndex(o=> Object.keys(o)[0] === code);
      if(idx === -1) return;
      const entry = this.tracking[idx][code];
      entry.perjalanan.push({ waktu: this.now(), keterangan: this.newProgress || 'Update status' });
      this.newProgress = '';
      this.$emit('update-tracking', this.tracking);
    }
  }
});
