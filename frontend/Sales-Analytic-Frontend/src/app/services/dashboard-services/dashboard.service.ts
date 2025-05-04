import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = `${environment.apiUrl}/api/landing`;

  constructor(private http: HttpClient) {}

  getRevenueChartData(username: string, year: number = 2024): Observable<any> {
    const params = new HttpParams().set('username', username).set('year', year);
    return this.http.get(`${this.baseUrl}/revenue-chart-data`, { params });
  }

  getWinChartData(username: string, year: number = 2024): Observable<any> {
    const params = new HttpParams().set('username', username).set('year', year);
    return this.http.get(`${this.baseUrl}/win-chart-data`, { params });
  }

  getKpiCards(username: string, year: number = 2024): Observable<any> {
    const params = new HttpParams().set('username', username).set('year', year);
    return this.http.get(`${this.baseUrl}/kpi-cards`, { params });
  }

  getPipelineChartData(username: string, year: number = 2024): Observable<any> {
    const params = new HttpParams().set('username', username).set('year', year);
    return this.http.get(`${this.baseUrl}/pipeline-chart-data`, { params });
  }

  getSigningsChartData(username: string, year: number = 2024): Observable<any> {
    const params = new HttpParams().set('username', username).set('year', year);
    return this.http.get(`${this.baseUrl}/signings-chart-data`, { params });
  }
}
