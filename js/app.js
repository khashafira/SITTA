new Vue({
  el:'#app',

  data:{
    tab: 'stok',
    mobileMenu: false,
    data: { 
      upbjjList:[], 
      kategoriList:[], 
      pengirimanList:[], 
      paket:[], 
      stok:[], 
      tracking:[]
    }
  },

  created(){
    APIService.fetchData().then(d=>{
      this.data = d;
    }).catch(err=>{
      console.error(err);
      alert('Failed to load the data.');
    });
  },

  methods:{

    refreshData(newPartial){
      if(newPartial.stok) this.data.stok = newPartial.stok;
      if(newPartial.tracking) this.data.tracking = newPartial.tracking;
    },

    handleNewOrder(order){
      const year = new Date().getFullYear();
      const seq = this.data.tracking.length + 1;

      const doNumber = `DO${year}-${String(seq).padStart(4,'0')}`;

      const paket = this.data.paket.find(p => p.kode === order.paket);

      const newDO = {};
      newDO[doNumber] = {
        nim: order.nim,
        nama: order.nama,
        paket: order.paket,
        pengiriman: order.pengiriman,
        tanggalKirim: new Date().toISOString(),
        total: paket.harga,
        perjalanan: [
          { waktu: new Date().toISOString(), keterangan: "Order dibuat melalui Form Pemesanan" }
        ]
      };

      this.data.tracking.push(newDO);
      alert(`Order berhasil dibuat! Nomor DO: ${doNumber}`);
    }

  } 
});   
