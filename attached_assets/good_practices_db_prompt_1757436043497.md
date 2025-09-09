# Sistema de Base de Datos de Bancos de Buenas Prácticas de Desarrollo

## Descripción General del Proyecto

Crear un sistema completo para gestionar y catalogar bancos de buenas prácticas de programas y políticas de desarrollo. El sistema debe distinguir claramente entre los **bancos** (repositorios/bases de datos) y las **buenas prácticas** individuales contenidas en estos.

## Arquitectura del Sistema

### 1. Modelo de Datos

#### Tabla: `bancos_practicas`
- `id` (Primary Key)
- `nombre` (VARCHAR 255)
- `descripcion` (TEXT)
- `url_principal` (VARCHAR 500)
- `pais_origen` (VARCHAR 100)
- `institucion_responsable` (VARCHAR 255)
- `tipo_banco` (ENUM: 'gubernamental', 'internacional', 'ong', 'academico', 'privado')
- `idiomas_disponibles` (JSON)
- `fecha_creacion` (DATE)
- `ultima_actualizacion` (TIMESTAMP)
- `estado` (ENUM: 'activo', 'inactivo', 'en_revision')
- `metadatos` (JSON)

#### Tabla: `buenas_practicas`
- `id` (Primary Key)
- `banco_id` (Foreign Key → bancos_practicas)
- `titulo` (VARCHAR 500)
- `descripcion_corta` (TEXT)
- `descripcion_detallada` (LONGTEXT)
- `pais` (VARCHAR 100)
- `region` (VARCHAR 100)
- `tema_principal` (VARCHAR 200)
- `temas_secundarios` (JSON)
- `sector` (VARCHAR 100)
- `subsector` (VARCHAR 100)
- `actores_involucrados` (JSON)
- `poblacion_objetivo` (VARCHAR 500)
- `fecha_implementacion` (DATE)
- `duracion_implementacion` (VARCHAR 100)
- `presupuesto_estimado` (DECIMAL)
- `moneda` (VARCHAR 10)
- `resultados_obtenidos` (TEXT)
- `indicadores_exito` (JSON)
- `lecciones_aprendidas` (TEXT)
- `replicabilidad` (ENUM: 'alta', 'media', 'baja')
- `escalabilidad` (ENUM: 'alta', 'media', 'baja')
- `sostenibilidad` (ENUM: 'alta', 'media', 'baja')
- `url_original` (VARCHAR 1000)
- `screenshot_path` (VARCHAR 500)
- `documentos_adjuntos` (JSON)
- `contacto_informacion` (JSON)
- `seguimiento_estado` (ENUM: 'completado', 'en_curso', 'suspendido', 'sin_seguimiento')
- `fecha_seguimiento` (DATE)
- `notas_seguimiento` (TEXT)
- `fecha_scraping` (TIMESTAMP)
- `estado_revision` (ENUM: 'pendiente', 'aprobada', 'rechazada', 'en_revision')
- `revisor_id` (Foreign Key → usuarios)
- `fecha_revision` (TIMESTAMP)
- `comentarios_revision` (TEXT)
- `tags` (JSON)
- `puntuacion_relevancia` (DECIMAL)
- `metadatos` (JSON)

#### Tabla: `usuarios`
- `id` (Primary Key)
- `username` (VARCHAR 100)
- `email` (VARCHAR 255)
- `password_hash` (VARCHAR 255)
- `rol` (ENUM: 'admin', 'revisor', 'consultor', 'readonly')
- `permisos` (JSON)
- `fecha_creacion` (TIMESTAMP)
- `ultimo_acceso` (TIMESTAMP)
- `estado` (ENUM: 'activo', 'inactivo')

#### Tabla: `scraping_logs`
- `id` (Primary Key)
- `banco_id` (Foreign Key)
- `fecha_scraping` (TIMESTAMP)
- `practicas_encontradas` (INTEGER)
- `practicas_nuevas` (INTEGER)
- `errores_encontrados` (JSON)
- `tiempo_ejecucion` (INTEGER)
- `estado` (ENUM: 'exitoso', 'parcial', 'fallido')

### 2. Backend de Administración

#### Funcionalidades Requeridas:

**Gestión de Bancos:**
- CRUD completo de bancos de prácticas
- Configuración de parámetros de scraping por banco
- Monitoreo del estado de cada banco
- Programación de scraping automático
- Vista dashboard con métricas

**Gestión de Prácticas:**
- Sistema de aprobación/rechazo de prácticas
- Editor enriquecido para descripciones
- Sistema de etiquetado y categorización
- Carga masiva mediante CSV/Excel
- Duplicación inteligente de prácticas detectada

**Sistema de Revisión:**
- Cola de prácticas pendientes de revisión
- Interfaz de revisión con vista previa
- Sistema de comentarios y anotaciones
- Flujo de aprobación multinivel
- Histórico de cambios y versiones

**Gestión de Screenshots:**
- Captura automática de screenshots
- Almacenamiento optimizado (WebP, compresión)
- Vista previa de screenshots
- Sistema de respaldo y archivado

### 3. Sistema de Scraping

#### Agente LLM (Recomendado: Ollama con Llama 3.1 o similar)

```python
# Configuración del agente LLM
AGENT_CONFIG = {
    "model": "llama3.1:8b",
    "temperature": 0.1,
    "max_tokens": 4096,
    "system_prompt": """
    Eres un agente especializado en identificar y extraer información de buenas prácticas 
    de desarrollo. Analiza el contenido web proporcionado y extrae:
    
    1. Información básica de la práctica
    2. Metadatos estructurados
    3. Actores involucrados
    4. Resultados e indicadores
    5. Información de contacto
    
    Responde únicamente en formato JSON válido.
    """
}
```

#### Scraping Autónomo

**Estrategias de Scraping:**
1. **Scraping Programado**: Ejecución diaria/semanal por banco
2. **Scraping Inteligente**: Detección de cambios en sitios web
3. **Scraping por Eventos**: Triggered por nuevos enlaces encontrados
4. **Scraping de Validación**: Verificación de URLs existentes

**Tecnologías Sugeridas:**
- Selenium WebDriver para sitios con JavaScript
- BeautifulSoup para parsing HTML
- Scrapy para scraping a gran escala
- Playwright para sitios modernos
- Requests para APIs simples

#### Sistema de Detección de Nuevas Prácticas

```python
# Algoritmo de detección
def detectar_nuevas_practicas(banco_config):
    # 1. Crawling inteligente del sitio
    # 2. Comparación con hash de contenido existente
    # 3. Análisis LLM de contenido nuevo
    # 4. Clasificación automática de relevancia
    # 5. Cola de revisión manual
```

### 4. API RESTful

#### Endpoints Principales:

**Bancos de Prácticas:**
```
GET    /api/v1/bancos                    # Listar bancos
GET    /api/v1/bancos/{id}              # Obtener banco específico
POST   /api/v1/bancos                   # Crear nuevo banco
PUT    /api/v1/bancos/{id}              # Actualizar banco
DELETE /api/v1/bancos/{id}              # Eliminar banco
```

**Buenas Prácticas:**
```
GET    /api/v1/practicas                # Listar prácticas con filtros
GET    /api/v1/practicas/{id}           # Obtener práctica específica
GET    /api/v1/practicas/search         # Búsqueda avanzada
POST   /api/v1/practicas                # Crear nueva práctica
PUT    /api/v1/practicas/{id}           # Actualizar práctica
DELETE /api/v1/practicas/{id}           # Eliminar práctica
```

**Búsquedas y Filtros:**
```
GET /api/v1/practicas/search?pais=chile&sector=salud&tema=covid-19
GET /api/v1/practicas/filter?actores=gobierno&fecha_desde=2020-01-01
GET /api/v1/practicas/tags?tags=["innovacion","digital"]
```

**Estadísticas:**
```
GET /api/v1/stats/general              # Estadísticas generales
GET /api/v1/stats/por-pais             # Distribución por país
GET /api/v1/stats/por-sector           # Distribución por sector
GET /api/v1/stats/tendencias           # Análisis de tendencias
```

### 5. Funcionalidades de Screenshot

#### Sistema de Captura:
```python
# Configuración de screenshot
SCREENSHOT_CONFIG = {
    "formato": "webp",
    "calidad": 80,
    "ancho_max": 1920,
    "alto_max": 1080,
    "timeout": 30,
    "retry_attempts": 3
}
```

#### Almacenamiento:
- Estructura de carpetas: `/screenshots/{año}/{mes}/{banco_id}/`
- Nomenclatura: `{practica_id}_{timestamp}.webp`
- Metadata JSON asociada a cada screenshot
- Sistema de limpieza automática de screenshots antiguos

### 6. Especificaciones Técnicas

#### Stack Tecnológico Recomendado:

**Backend:**
- Framework: Django/FastAPI (Python) o Node.js/Express
- Base de datos: PostgreSQL con índices full-text
- Cache: Redis para consultas frecuentes
- Queue: Celery para tareas asíncronas
- Storage: AWS S3/MinIO para screenshots

**Frontend (Admin Panel):**
- React.js/Vue.js con componentes administrativos
- Dashboard con Chart.js/D3.js
- Editor WYSIWYG para descripciones
- Sistema de drag-and-drop para archivos

**Scraping:**
- Docker containers para aislamiento
- Proxies rotativos para evitar bloqueos
- User-agent rotation
- Rate limiting inteligente

### 7. Documentación de API

#### Autenticación:
```yaml
security:
  - bearerAuth: []
  - apiKey: []
```

#### Ejemplo de Response:
```json
{
  "success": true,
  "data": {
    "practicas": [
      {
        "id": 1,
        "titulo": "Programa de Digitalización Rural",
        "pais": "Chile",
        "sector": "Tecnología",
        "tema_principal": "Inclusión Digital",
        "actores_involucrados": [
          {
            "tipo": "gobierno",
            "nombre": "Ministerio de Desarrollo Social",
            "rol": "Implementador principal"
          }
        ],
        "fecha_implementacion": "2021-03-15",
        "seguimiento": {
          "estado": "completado",
          "ultima_actualizacion": "2023-12-01"
        },
        "url_original": "https://ejemplo.cl/practica",
        "screenshot_url": "/api/v1/screenshots/1/latest",
        "puntuacion_relevancia": 8.5
      }
    ]
  },
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 156,
    "pages": 8
  },
  "filters_applied": {
    "pais": "Chile",
    "sector": "Tecnología"
  }
}
```

### 8. Características Especiales

#### Sistema de Calificación Automática:
- Algoritmo ML para evaluar relevancia de prácticas
- Puntuación basada en completitud de información
- Factor de impacto por número de beneficiarios
- Bonus por disponibilidad de seguimiento

#### Monitor de Salud de URLs:
- Verificación periódica de enlaces
- Notificaciones de enlaces rotos
- Sistema de wayback machine integration
- Alertas automáticas al equipo

#### Análisis de Duplicados:
- Detección de prácticas similares
- Fuzzy matching en títulos y descripciones
- Sugerencias de consolidación
- Métricas de similitud

### 9. Casos de Uso de la API

#### Para Investigadores:
```python
# Buscar prácticas de educación en América Latina
response = requests.get(
    "https://api.buenaspracticas.org/v1/practicas/search",
    params={
        "tema": "educacion",
        "region": "america_latina",
        "fecha_desde": "2020-01-01",
        "incluye_seguimiento": True
    }
)
```

#### Para Tomadores de Decisión:
```python
# Obtener resumen ejecutivo de prácticas por sector
response = requests.get(
    "https://api.buenaspracticas.org/v1/stats/resumen-ejecutivo",
    params={
        "pais": "colombia",
        "periodo": "2023"
    }
)
```

### 10. Criterios de Éxito

#### Métricas del Sistema:
- Tiempo de respuesta API < 200ms
- Disponibilidad > 99.5%
- Precisión de scraping > 90%
- Rate de aprobación de prácticas > 80%
- Satisfacción de usuarios > 4.5/5

#### KPIs de Negocio:
- Número de bancos integrados
- Prácticas catalogadas por mes
- Consultas API por día
- Usuarios activos del sistema
- Tiempo promedio de revisión

### 11. Plan de Implementación

#### Fase 1 (Meses 1-2): MVP
- Modelo de datos básico
- CRUD de bancos y prácticas
- API básica
- Sistema de screenshots

#### Fase 2 (Meses 3-4): Scraping
- Implementación del agente LLM
- Scraping básico
- Sistema de aprobación
- Panel de administración

#### Fase 3 (Meses 5-6): Avanzado
- ML para calificación automática
- Analytics avanzados
- Optimizaciones de performance
- Documentación completa

---

## Instrucciones de Desarrollo

1. **Prioriza la calidad de datos**: Implementar validaciones estrictas
2. **Escalabilidad desde el inicio**: Diseñar para manejar 100K+ prácticas
3. **UX/UI centrado en el usuario**: Interface intuitiva para diferentes tipos de usuarios
4. **Monitoreo exhaustivo**: Logging detallado y métricas en tiempo real
5. **Seguridad por diseño**: Autenticación robusta, validación de inputs, rate limiting

Este prompt debe resultar en un sistema robusto, escalable y útil para la comunidad de desarrollo internacional.