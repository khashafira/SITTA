const APIService = {
  async fetchData() {
    const resp = await fetch('data/dataBahanAjar.json');
    if (!resp.ok) throw new Error('Failed to load the data');
    return resp.json();
  }
};
