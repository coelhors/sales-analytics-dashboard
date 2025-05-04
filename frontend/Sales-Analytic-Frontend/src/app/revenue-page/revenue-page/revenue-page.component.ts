import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  OnDestroy,
  ViewEncapsulation,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { HeaderComponent } from '../../header/header.component';
import { RevenueService } from '../../services/revenue-services/revenue.service';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-revenue-page',
  imports: [
    NgApexchartsModule,
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    FormsModule,
  ],
  standalone: true,
  templateUrl: './revenue-page.component.html',
  styleUrls: ['./revenue-page.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class RevenuePageComponent
  implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy
{
  @ViewChild('barChartRef') barChartRef!: ChartComponent;
  @ViewChild('areaChartRef') areaChartRef!: ChartComponent;

  revenueData: any[] = [];
  revenueDataUnfiltered: any[] = [];
  revenueChartData: any[] = [];
  cards: any[] = [];
  isDataLoaded: boolean = false;

  showFilterOverlay: boolean = false;
  searchTerm: string = '';

  selectedFilters: {
    product_category: Set<string>;
    fiscal_quarter: Set<string>;
  } = {
    product_category: new Set<string>(),
    fiscal_quarter: new Set<string>(),
  };

  uniqueProductCategories: string[] = [];
  uniqueQuarters: string[] = [];

  private username: string = '';
  private loadCount = 0;
  private totalLoadsNeeded = 2;

  // MutationObserver to monitor dark-mode changes.
  private themeObserver!: MutationObserver;

  constructor(private revenueService: RevenueService, private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Revenue | Sales Analytics');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = user.username;
    if (!this.username) return;

    this.fetchRevenueClients();
    this.fetchRevenueChart();
    this.fetchQuarterlyTargets();
    this.fetchIndustryRevenueAreaChart();

    // Set up MutationObserver to detect dark mode changes.
    this.themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          console.log('[RevenuePageComponent] Theme change detected.');
          this.toggleChartTheme();
        }
      });
    });
    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  ngAfterViewInit(): void {
    // Delay updating theme so that the "dark-mode" class (if any) is applied.
    setTimeout(() => {
      this.toggleChartTheme();
    }, 500);
  }

  ngAfterViewChecked(): void {
    this.toggleChartTheme();
  }

  ngOnDestroy(): void {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  /**
   * toggleChartTheme updates the charts' styling.
   * Here, the tooltip is forced to always use the "dark" theme so that
   * tooltips are rendered consistently with dark styling, regardless of the page's mode.
   */
  toggleChartTheme(): void {
    const isDark = document.body.classList.contains('dark-mode');
    const foreColor = isDark ? '#fff' : '#000';
    console.log(
      `[RevenuePageComponent] toggleChartTheme: isDark=${isDark}, foreColor=${foreColor}`
    );

    if (this.barChartRef) {
      this.barChartRef.updateOptions(
        {
          theme: { mode: isDark ? 'dark' : 'light' },
          chart: { foreColor: foreColor },
          grid: {
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          },
          xaxis: { labels: { style: { colors: [foreColor] } } },
          yaxis: {
            labels: { style: { colors: [foreColor] } },
            title: { text: 'Revenue ($)', style: { color: foreColor } },
          },
          // **Force tooltip to ALWAYS use dark theme** (so tooltips have a dark background with white text)
          tooltip: { theme: 'dark' },
        },
        false,
        true
      );
    }

    if (this.areaChartRef) {
      this.areaChartRef.updateOptions(
        {
          theme: { mode: isDark ? 'dark' : 'light' },
          chart: { foreColor: foreColor },
          xaxis: { labels: { style: { colors: [foreColor] } } },
        },
        false,
        true
      );
    }
  }

  private markLoaded(): void {
    this.loadCount++;
    if (this.loadCount >= this.totalLoadsNeeded) {
      this.isDataLoaded = true;
    }
  }

  fetchRevenueClients(): void {
    this.revenueService.getRevenue(this.username).subscribe({
      next: (res) => {
        const formattedData = res.revenue.map((r: any) => ({
          client_name: r.client_name,
          product_name: r.product_name,
          product_category: r.product_category,
          amount: r.amount,
          month: r.month,
          fiscal_quarter: r.fiscal_quarter,
          fiscal_year: r.fiscal_year,
        }));

        this.revenueDataUnfiltered = formattedData;
        this.revenueData = [...formattedData];

        this.uniqueProductCategories = [
          ...new Set<string>(
            formattedData.map((row: any) => row.product_category as string)
          ),
        ];

        this.uniqueQuarters = [
          ...new Set<string>(
            formattedData.map((row: any) => row.fiscal_quarter as string)
          ),
        ];
      },
      error: (err) => console.error('Revenue fetch error:', err),
    });
  }

  fetchRevenueChart(): void {
    this.revenueService.getRevenueProductDistribution(this.username).subscribe({
      next: (res) => {
        this.revenueChartData = res.bubble_data.map((item: any) => ({
          category: item.product_category,
          data: item.data,
        }));

        const categories = ['Q1', 'Q2', 'Q3', 'Q4'];
        const series = this.revenueChartData.map((item) => ({
          name: item.category,
          data: item.data.map((entry: number[]) => entry[1]),
        }));

        this.barChart.series = series;
        this.barChart.xaxis.categories = categories;
        this.markLoaded();
      },
      error: (err) => {
        console.error('Revenue chart error:', err);
        this.markLoaded();
      },
    });
  }

  toggleFilter(
    category: keyof typeof this.selectedFilters,
    value: string,
    event: Event
  ): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedFilters[category].add(value);
    } else {
      this.selectedFilters[category].delete(value);
    }
  }

  applyFilters(): void {
    this.revenueData = this.revenueDataUnfiltered.filter(
      (row) =>
        (!this.selectedFilters.product_category.size ||
          this.selectedFilters.product_category.has(row.product_category)) &&
        (!this.selectedFilters.fiscal_quarter.size ||
          this.selectedFilters.fiscal_quarter.has(row.fiscal_quarter)) &&
        (!this.searchTerm ||
          row.client_name.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
    this.showFilterOverlay = false;
  }

  clearFilters(): void {
    this.selectedFilters.product_category.clear();
    this.selectedFilters.fiscal_quarter.clear();
    this.searchTerm = '';
    this.revenueData = [...this.revenueDataUnfiltered];
    this.showFilterOverlay = false;
  }

  onOverlayClick(event: MouseEvent): void {
    this.showFilterOverlay = false;
  }

  fetchQuarterlyTargets(): void {
    this.revenueService.getRevenueQuarterlyTargets(this.username).subscribe({
      next: (res) => {
        const quarters = res.quarterly_targets;
        this.cards = quarters.map((q: any) => ({
          title: `Q${q.quarter} Target`,
          value: `$${q.accumulated_value.toLocaleString()}`,
          percentage: `${q.achievement_percentage.toFixed(1)}% Achieved`,
        }));
        this.markLoaded();
      },
      error: (err) => {
        console.error('Quarterly targets error:', err);
        this.markLoaded();
      },
    });
  }

  fetchIndustryRevenueAreaChart(): void {
    this.revenueService.getIndustryRevenueAreaChart(this.username).subscribe({
      next: (res) => {
        this.areaChart.series = res.industry_data.map((item: any) => ({
          name: item.industry,
          data: item.data,
        }));
        this.areaChart.xaxis.categories = res.quarters.map(
          (q: number) => `Q${q}`
        );
        this.markLoaded();
      },
      error: (err) => {
        console.error('Industry Revenue area chart error:', err);
        this.markLoaded();
      },
    });
  }

  barChart = {
    chart: {
      type: 'bar' as const,
      height: 350,
      background: 'transparent',
      foreColor: 'var(--text-color)',
    },
    series: [] as { name: string; data: number[] }[],
    xaxis: {
      title: { text: 'Quarters' },
      categories: [] as string[],
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '50%', distributed: true },
    },
    dataLabels: { enabled: false },
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560'],
    tooltip: {
      enabled: true,
      theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light',
      y: {
        formatter: (value: number) => {
          return `$${Math.round(value).toLocaleString()}`;
        }},
    },
    theme: {
      mode: document.body.classList.contains('dark-mode') ? 'dark' : 'light',
    },
  };

  areaChart = {
    series: [] as any[],
    chart: {
      toolbar: { show: false },
      type: 'area' as const,
      height: 350,
      background: 'transparent',
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' as const },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      categories: [] as string[],
      title: { text: 'Quarters' },
    },
    colors: ['#4285F4', '#DB4437', '#F4B400', '#0F9D58'],
    tooltip: {
      theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light',
    },
    theme: {
      mode: document.body.classList.contains('dark-mode') ? 'dark' : 'light',
    },
  };
}
