# Overview

This project is a **Sistema de Base de Datos de Bancos de Buenas Prácticas de Desarrollo** - a comprehensive system for managing and cataloging banks of best practices for development programs and policies. The system distinguishes between "banks" (repositories/databases that contain practices) and "practices" (the actual development initiatives and policies). It features a React-based frontend with an Express.js backend, PostgreSQL database with Drizzle ORM, and authentication through Replit's OAuth system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Custom component system built on Radix UI primitives with Tailwind CSS
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Theme**: Light/dark theme support with CSS custom properties

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with structured error handling
- **Session Management**: Express sessions with PostgreSQL store
- **Middleware**: Custom logging, CORS, and authentication middleware

## Database Architecture
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Key Entities**:
  - `bancos_practicas`: Repository/database metadata
  - `buenas_practicas`: Individual practice records with comprehensive metadata
  - `usuarios`: User management for authentication
  - `sessions`: Session storage for authentication state

## Authentication & Authorization
- **Provider**: Replit OAuth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Access Control**: Route-level authentication middleware
- **User Roles**: Role-based access with admin, reviewer, consultant, and read-only levels

## Data Model Design
The system implements a hierarchical structure where banks contain multiple practices. Each practice includes extensive metadata covering implementation details, outcomes, replicability assessments, and review workflow states. The schema supports multilingual content, JSON-based flexible metadata, and comprehensive audit trails.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connection**: WebSocket-based connections for serverless compatibility

## Authentication Services
- **Replit Auth**: OAuth 2.0 / OpenID Connect integration
- **Session Management**: connect-pg-simple for PostgreSQL session storage

## Development Tools
- **Vite**: Development server and build tool with HMR
- **Replit Integration**: Runtime error modal and cartographer plugins for development environment

## UI Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

## Form & Validation
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **Drizzle Zod**: Integration between Drizzle ORM and Zod schemas

## Utilities & Enhancement
- **TanStack Query**: Server state synchronization and caching
- **date-fns**: Date manipulation with internationalization support
- **class-variance-authority**: Type-safe CSS class variance management