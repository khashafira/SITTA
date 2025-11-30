const APIService = {
  async fetchData() {
    const resp = await fetch('data/dataBahanAjar.json');
    if (!resp.ok) throw new Error('Gagal load data');
    return resp.json();
  }
};
