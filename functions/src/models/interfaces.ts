export interface scholarOfficialData {
  ronin_address: string,
  ronin_slp: number,
  total_slp: number,
  in_game_slp: number,
  rank: number,
  mmr: number,
  total_matches: number,
  win_rate?: string,
  ign: string,
}
export interface scholarFirebaseI {
  roninAddress: string,
  name: string;
  personalAddress?: string;
}
export interface userLink{
  roninAddress: string;
  uid: string;
  avatar: string;
}
export interface statsData{
  client_id:string,
  win_total: number,
  draw_total: number,
  lose_total: number,
  elo: number,
  rank: number,
  name: string
}
export interface earningsData {
  address: string,
  slp_holdings: number,
  slp_inventory: number,
  slp_in_total: number,
  last_claimed: number,
  next_claim: string,
}