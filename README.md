# Google Cloud Sales Analytics Application

A comprehensive sales analytics platform designed to track and analyze Google Cloud sales performance, pipeline management, and customer relationships.

## Project Overview

This capstone project is a full-stack web application that provides sales executives and directors with powerful tools to monitor, analyze, and optimize their sales performance for Google Cloud products and services. The application features role-based access control, interactive visualizations, and detailed reporting capabilities across multiple business dimensions.

## Key Features

### 🎯 Dashboard & KPIs
- Real-time Key Performance Indicators (Pipeline, Revenue, Signings, Wins)
- Interactive charts including revenue histograms, win distributions, and pipeline composition
- Role-based data visibility (Directors see aggregated data, Account Executives see their client data)

### 📊 Sales Pipeline Management
- Opportunity tracking through sales stages (Qualify → Refine → Tech Eval → Proposal → Migrate)
- Forecast categories (Omit → Pipeline → Upside → Commit → Closed-Won)
- Advanced filtering and search capabilities
- Pipeline funnel visualization and product category heatmaps

### 💼 Contract & Revenue Tracking
- Contract signing management with ACV/TCV calculations
- Monthly revenue recognition and tracking
- Industry and geographic distribution analysis
- Quarterly target achievement monitoring

### 🏆 Sales Wins System
- Technical win achievements tracking (GCP and Data Analytics categories)
- Multiple win pathways and levels
- Win multiplier system for performance evaluation
- Quarterly evolution and category distribution charts

### 👥 Client Management
- Comprehensive client portfolio visualization
- Industry treemap and provincial distribution charts
- Filtering by geography and industry sector
- Detailed client information with account executive assignments

### 👔 Executive Management
- Account executive performance monitoring
- Team performance comparison charts
- Executive directory and contact management

## Technology Stack

### Backend
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: PostgreSQL (hosted on Neon)
- **API Structure**: RESTful endpoints using Flask blueprints
- **Authentication**: JWT

### Frontend
- **Framework**: Angular
- **Charts**: ApexCharts
- **Visualizations**: 
  - Histogram charts for revenue and win distributions
  - Pie charts for pipeline and signings composition
  - Funnel charts for sales stage progression
  - Heatmaps for product-forecast analysis
  - Treemaps for client industry distribution
  - Polar area charts for geographic analysis
  - Bubble charts for multi-dimensional data
  - Stacked area charts for time-series analysis

## Database Schema

The application uses a comprehensive database schema including:

- **Users**: Account executives, directors, and administrators
- **Clients**: Customer organizations with industry and geographic data
- **Products**: Google Cloud products organized by category
- **Opportunities**: Sales pipeline tracking
- **Signings**: Contract details and financial information
- **Revenue**: Monthly revenue recognition
- **Wins**: Technical achievement tracking
- **Targets**: Quarterly and yearly performance goals



## Win Achievement System

The application tracks two categories of wins:
- **GCP (Google Cloud Platform)**: Core infrastructure and platform services
- **DA (Data Analytics)**: Data processing and analytics products

Each category has multiple levels (Win 1, Win 2, Win 3) with various pathways to achievement through revenue thresholds or specific contract values.

## Key Performance Indicators

The system tracks several critical KPIs:
- Total Contract Value (TCV)
- Annual Contract Value (ACV)
- Pipeline Coverage Ratio
- Win Rate
- Revenue per Client
- Average Deal Size
- Sales Cycle Length

## License

This project is part of a capstone project for educational purposes.

## Authors

This project was developed as a capstone project for the Software Development program at SAIT (Southern Alberta Institute of Technology). It was a collaborative group effort by:

- **Rafael Santos Coelho** - Backend Development
- **[Connor Davison](https://github.com/ConDavison1/)** - Frontend & Backend Development
- **[Logan Buye](https://github.com/loganbuye)** - Frontend Development
- **[Kyle Guenter](https://github.com/KJG19)** - Frontend Development

## Project Context

This application was created as the culminating project for the SAIT Software Development program, demonstrating our ability to design and implement a full-stack enterprise application using modern web technologies and best practices.
