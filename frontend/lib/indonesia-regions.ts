// Indonesian regions data
// Source: Kemendagri

export interface Province {
  id: string;
  name: string;
}

export interface City {
  id: string;
  provinceId: string;
  name: string;
}

export interface District {
  id: string;
  cityId: string;
  name: string;
}

export interface Village {
  id: string;
  districtId: string;
  name: string;
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const API_BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";

export async function getProvinces(): Promise<Province[]> {
  try {
    const res = await fetch(`${API_BASE}/provinces.json`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function getCities(provinceId: string): Promise<City[]> {
  try {
    const res = await fetch(`${API_BASE}/regencies/${provinceId}.json`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function getDistricts(cityId: string): Promise<District[]> {
  try {
    const res = await fetch(`${API_BASE}/districts/${cityId}.json`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function getVillages(districtId: string): Promise<Village[]> {
  try {
    const res = await fetch(`${API_BASE}/villages/${districtId}.json`);
    return await res.json();
  } catch {
    return [];
  }
}
