const isProd = import.meta.env.PROD;
export const API_URL = isProd ? '/api' : 'http://localhost:8000/api';

export const fetchAllData = async () => {
  try {
    const response = await fetch(`${API_URL}/sync`);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();

    // Map db fields to frontend fields
    ['artis', 'pencipta'].forEach(table => {
      if (data[table]) {
        data[table] = data[table].map(item => ({
          ...item,
          alias: item.panggung || '',
          ktp: item.nik || item.ktp || '', // fallback to ktp column for old data
          alamat: item.address || '',
          norek: item.bankAccount || '',
          atasNama: item.bankName || '',
          ktpFile: item.nik ? item.ktp : null, // If nik exists, ktp is the file. If not, ktp is the number.
          fotoProfile: item.avatar || null
        }));
      }
    });

    if (data.kontrak) {
      data.kontrak = data.kontrak.map(item => ({
        ...item,
        pihak2_ktp: item.pihak2_nik || item.pihak2_ktp || '',
        pihak1_wakil: item.pihak1_wakil || item.pihak1_nama || '',
      }));
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

const mapToDB = (table, data) => {
  const dbData = { ...data };
  if (table === 'artis' || table === 'pencipta') {
    dbData.panggung = data.alias;
    dbData.nik = data.ktp;
    dbData.address = data.alamat;
    dbData.bankAccount = data.norek;
    dbData.bankName = data.atasNama;
    dbData.ktp = data.ktpFile;
    dbData.avatar = data.fotoProfile;
    
    // Remove frontend-only keys
    delete dbData.alias;
    delete dbData.alamat;
    delete dbData.norek;
    delete dbData.atasNama;
    delete dbData.ktpFile;
    delete dbData.fotoProfile;
  }
  if (table === 'kontrak') {
    dbData.pihak1_nama = data.pihak1_wakil || '';
    dbData.pihak2_nik = data.pihak2_ktp;
    
    delete dbData.pihak2_ktp;
    delete dbData.pihak1_wakil;
  }
  return dbData;
};

export const createItem = async (table, data) => {
  try {
    const mappedData = mapToDB(table, data);
    const response = await fetch(`${API_URL}/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mappedData)
    });
    if (!response.ok) throw new Error('Failed to create item');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

export const updateItem = async (table, id, data) => {
  try {
    const mappedData = mapToDB(table, data);
    const response = await fetch(`${API_URL}/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mappedData)
    });
    if (!response.ok) throw new Error('Failed to update item');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

export const deleteItem = async (table, id) => {
  try {
    const response = await fetch(`${API_URL}/${table}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete item');
    return true;
  } catch (error) {
    console.error('API Error:', error);
    return false;
  }
};
