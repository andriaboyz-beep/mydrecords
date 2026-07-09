// Saat produksi di cPanel, keduanya berjalan di origin yang sama (misal port 80/443), jadi gunakan path relatif
const isProd = import.meta.env.PROD;
const API_URL = isProd ? '/api' : 'http://localhost:8000/api';

export const fetchAllData = async () => {
  try {
    const response = await fetch(`${API_URL}/sync`);
    if (!response.ok) throw new Error('Failed to fetch data');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

export const createItem = async (table, data) => {
  try {
    const response = await fetch(`${API_URL}/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
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
    const response = await fetch(`${API_URL}/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
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
