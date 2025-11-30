Vue.component('ba-stock-table', {
  props:['data','upbjjList','kategoriList'],
  template: `
  <div class="card">
    <div class="controls">
      <input class="input" placeholder="Cari judul / kode..." v-model="searchQuery" @keyup.esc="clearSearch" @keyup.enter="focusAdd" />
      <select v-model="filterUpbjj">
        <option value="">Semua UT-daerah</option>
        <option v-for="u in upbjjList" :key="u" :value="u">{{u}}</option>
      </select>

      <select v-if="filterUpbjj" v-model="filterKategori">
        <option value="">Semua Kategori</option>
        <option v-for="k in kategoriOptions" :key="k" :value="k">{{k}}</option>
      </select>

      <select v-model="stockFilter">
        <option value="">Semua stok</option>
        <option value="belowSafety">Stok &lt; Safety</option>
        <option value="zero">Stok = 0</option>
      </select>

      <select v-model="sortBy">
        <option value="">-- Sort --</option>
        <option value="judul">Judul</option>
        <option value="qty">Stok</option>
        <option value="harga">Harga</option>
      </select>

      <button class="btn" @click="resetFilters">Reset</button>
      <div style="margin-left:auto">
        <button class="btn" @click="showAdd = !showAdd">{{ showAdd ? 'Tutup' : 'Tambah Bahan Ajar' }}</button>
      </div>
    </div>

    <!-- Add / Edit form -->
    <div v-show="showAdd" class="card">
      <div class="form-row">
        <input class="input" v-model="form.kode" placeholder="Kode (wajib)" @keyup.enter="submitForm"/>
        <input class="input" v-model="form.judul" placeholder="Judul (wajib)" @keyup.enter="submitForm"/>
        <select v-model="form.kategori"><option v-for="k in kategoriList" :key="k">{{k}}</option></select>
        <select v-model="form.upbjj"><option v-for="u in upbjjList" :key="u">{{u}}</option></select>
      </div>
      <div class="form-row" style="margin-top:8px">
        <input class="input" v-model.number="form.harga" placeholder="Harga" @keyup.enter="submitForm"/>
        <input class="input" v-model.number="form.qty" placeholder="Qty" @keyup.enter="submitForm"/>
        <input class="input" v-model.number="form.safety" placeholder="Safety" @keyup.enter="submitForm"/>
        <input class="input" v-model="form.lokasiRak" placeholder="Lokasi Rak" @keyup.enter="submitForm"/>
      </div>
      <div style="margin-top:8px">
        <textarea class="input" v-model="form.catatanHTML" placeholder="Catatan (HTML allowed)"></textarea>
      </div>
      <div style="margin-top:8px;text-align:right">
        <button class="btn" @click="submitForm">{{editing ? 'Update' : 'Simpan'}}</button>
      </div>
      <div v-if="formError" class="small" style="color:#c43030;margin-top:6px">{{formError}}</div>
    </div>

    <!-- Table -->
    <table class="table">
      <thead>
        <tr>
          <th>Kode</th><th>Judul</th><th>Kategori</th><th>UT-Daerah</th><th>Lokasi</th><th>Harga</th><th>Qty</th><th>Safety</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in filteredAndSorted" :key="item.kode">
          <td>{{item.kode}}</td>
          <td>{{item.judul}}</td>
          <td>{{item.kategori}}</td>
          <td>{{item.upbjj}}</td>
          <td>{{item.lokasiRak}}</td>
          <td v-text="formatCurrency(item.harga)"></td>
          <td v-text="formatQty(item.qty)"></td>
          <td v-text="formatQty(item.safety)"></td>
          <td>
            <status-badge :qty="item.qty" :safety="item.safety"></status-badge>
            <span class="small right" style="margin-left:8px;position:relative;">
              <button class="small" @mouseenter="showTooltip($event, item.catatanHTML)" @mouseleave="hideTooltip">Info</button>
            </span>
          </td>
          <td>
            <button class="btn" @click="editItem(item)">Edit</button>
            <button class="btn" style="background:#c43030;margin-left:6px;" @click="confirmDelete(item)">Delete</button>
          </td>
        </tr>
        <tr v-if="filteredAndSorted.length===0"><td colspan="10" class="small">Tidak ada data</td></tr>
      </tbody>
    </table>

    <!-- tooltip -->
    <div v-if="tooltip.visible" :style="{left: tooltip.x + 'px', top: tooltip.y + 'px'}" class="tooltip" v-html="tooltip.html"></div>
  </div>
  `,
  data(){
    return {
      stok: this.data.stok.slice(), // local copy
      searchQuery: '',
      filterUpbjj: '',
      filterKategori: '',
      stockFilter: '',
      sortBy: '',
      showAdd: false,
      form: { kode:'', judul:'', kategori:this.kategoriList[0]||'', upbjj:this.upbjjList[0]||'', lokasiRak:'', harga:0, qty:0, safety:0, catatanHTML:'' },
      editing:false,
      formError:'',
      tooltip:{visible:false,x:0,y:0,html:''}
    };
  },
  computed:{
    kategoriOptions(){
      return this.kategoriList;
    },
    filteredAndSorted(){
      let list = this.stok.slice();

      // search
      if(this.searchQuery){
        const q = this.searchQuery.toLowerCase();
        list = list.filter(it => (it.judul+it.kode).toLowerCase().includes(q));
      }
      if(this.filterUpbjj){
        list = list.filter(it => it.upbjj === this.filterUpbjj);
      }
      if(this.filterKategori){
        list = list.filter(it => it.kategori === this.filterKategori);
      }
      if(this.stockFilter === 'belowSafety'){
        list = list.filter(it => it.qty < it.safety && it.qty > 0);
      } else if(this.stockFilter === 'zero'){
        list = list.filter(it => it.qty === 0);
      }

      // sort
      if(this.sortBy === 'judul'){
        list.sort((a,b)=> a.judul.localeCompare(b.judul));
      } else if(this.sortBy === 'qty'){
        list.sort((a,b)=> a.qty - b.qty);
      } else if(this.sortBy === 'harga'){
        list.sort((a,b)=> a.harga - b.harga);
      }

      return list;
    }
  },
  watch:{
    filterUpbjj(newV, oldV){
      if(!newV) this.filterKategori = '';
    },
    searchQuery(newV){
      if(newV.length>0) this.stockFilter = '';
    }
  },
  methods:{
    formatCurrency(v){
      if (v == null) return '-';
      return 'Rp ' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    formatQty(v){ return v + ' buah'; },
    resetFilters(){
      this.searchQuery = ''; this.filterUpbjj=''; this.filterKategori=''; this.stockFilter=''; this.sortBy='';
    },
    focusAdd(){ this.showAdd = true; this.$nextTick(()=>{ /* optional focus */ }); },
    submitForm(){
      // simple validation
      if(!this.form.kode || !this.form.judul){ this.formError = 'Kode dan Judul wajib diisi'; return; }
      this.formError = '';
      if(this.editing){
        const idx = this.stok.findIndex(s=>s.kode===this.form.kode);
        if(idx>=0) this.$set(this.stok, idx, Object.assign({}, this.form));
        this.editing = false;
      } else {
        if(this.stok.find(s=>s.kode===this.form.kode)){ this.formError='Kode sudah ada'; return; }
        this.stok.push(Object.assign({}, this.form));
      }
      this.showAdd = false;
      this.$emit('update-data', { stok: this.stok });
      this.form = { kode:'', judul:'', kategori:this.kategoriList[0]||'', upbjj:this.upbjjList[0]||'', lokasiRak:'', harga:0, qty:0, safety:0, catatanHTML:'' };
    },
    editItem(item){
      this.form = Object.assign({}, item);
      this.editing = true;
      this.showAdd = true;
    },
    async confirmDelete(item){
      const ok = await this.$root.$refs.modal.open({ title:'Hapus bahan ajar', message: `Yakin menghapus <strong>${item.judul}</strong>?` });
      if(ok){
        this.stok = this.stok.filter(s=>s.kode !== item.kode);
        this.$emit('update-data', { stok: this.stok });
      }
    },
    showTooltip(evt, html){
      const rect = document.body.getBoundingClientRect();
      this.tooltip.html = html || '<em>Tidak ada catatan</em>';
      this.tooltip.x = evt.clientX + 12;
      this.tooltip.y = evt.clientY + 12;
      this.tooltip.visible = true;
    },
    hideTooltip(){ this.tooltip.visible = false; }
  }
});
