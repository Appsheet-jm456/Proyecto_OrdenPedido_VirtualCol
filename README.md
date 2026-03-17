# 📦 Sistema de Órdenes de Pedido — Ventas Virtuales Colombia

App web full stack construida en **Google Apps Script** para gestionar órdenes 
de pedido de equipos tech entre distribuidores. Controla el ciclo completo de 
préstamo, facturación y devolución de equipos.

---

## 🏪 Negocio

**Ventas Virtuales Colombia**  
Av 5 a # 23 D Norte - 66, Ctro Comercial Pasarela Local 2 - 107, Cali  
Celular: 3175591252

Distribuidores de otros locales solicitan equipos (torres, tiny PC, mini PC, 
portátiles). Este sistema lleva el control de quién pidió, qué equipo, cuándo 
se entregó, si pagó y cuándo lo devolvió.

---

## ✨ Funcionalidades

- **Login con roles** — Super admin, Vendedor, Auxiliar
- **Dashboard** con conteo de órdenes por estado en tiempo real
- **Gestión de órdenes** — crear, actualizar estado, ver detalle
- **Modal de acción** — cambio de estado con transiciones controladas
- **Alerta automática** — si el equipo no regresa en 1 día hábil, el estado 
  cambia automáticamente a *Por Cobrar/Devolver*
- **CRUD de Clientes y Usuarios**
- **Reporte Excel XLSX** con filtros dinámicos y previsualización
- **Impresión PDF** en formato carta con encabezado del negocio

---

## 🔄 Estados de una orden
```
Pendiente → Prestado → Facturado → Regresado
                ↓
        Por Cobrar/Devolver  (automático al vencer 1 día hábil)
```

| Estado | Color |
|---|---|
| Pendiente | Naranja |
| Prestado | Verde |
| Por Cobrar/Devolver | Rojo (parpadea) |
| Facturado | Azul |
| Regresado | Gris |

---

## 🗄️ Base de datos

Google Sheets como base de datos (5 hojas):

| Hoja | Descripción |
|---|---|
| Usuarios | Autenticación y roles |
| Clientes | Locales distribuidores |
| Productos | Catálogo de equipos |
| Orden_Pedido | Cabecera de cada orden |
| Detalle_Pedido | Ítems por orden |

---

## 🗂️ Estructura del proyecto
```
Proyecto_OrdenPedido_VirtualCol/
├── CLAUDE.md          # Contexto del proyecto para Claude Code
├── README.md          # Este archivo
├── Codigo.gs          # Backend: doGet(), doPost(), CRUD, triggers
├── Index.html         # Frontend SPA principal
├── Estilos.html       # CSS completo
└── Javascript.html    # JavaScript del cliente
```

---

## 🚀 Stack técnico

| Capa | Tecnología |
|---|---|
| Backend | Google Apps Script |
| Frontend | HTML + CSS + JavaScript (HtmlService) |
| Base de datos | Google Sheets |
| Autenticación | PropertiesService (token de sesión) |
| Reportes | SpreadsheetApp + DriveApp (xlsx) |
| PDF | window.print() + CSS @media print |
| Automatización | ScriptApp Triggers (verificación cada hora) |

---

## ⚙️ Instalación y despliegue

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/Proyecto_OrdenPedido_VirtualCol.git
cd Proyecto_OrdenPedido_VirtualCol
```

### 2. Crear el proyecto en Google Apps Script
1. Ir a [script.google.com](https://script.google.com)
2. Crear nuevo proyecto → nombrar **OrdenPedido_VirtualCol**
3. Copiar el contenido de cada archivo `.gs` y `.html` en su archivo correspondiente

### 3. Configurar Google Sheets
1. Abrir el Google Sheet con ID: `1pvt1nDIKHwxSduUH8H0d3fglOfsuoSqJ2JrR9HPO5nk`
2. Verificar que existan las 5 hojas: Usuarios, Clientes, Productos, Orden_Pedido, Detalle_Pedido
3. Crear el primer usuario Super admin manualmente en la hoja Usuarios

### 4. Configurar el trigger automático
En el editor de Apps Script → Triggers → Agregar trigger:
- Función: `verificarVencimientos`
- Tipo: basado en tiempo → cada hora

### 5. Desplegar como web app
1. Implementar → Nueva implementación → Aplicación web
2. Ejecutar como: **Yo (tu cuenta)**
3. Acceso: **Cualquier usuario** (o solo usuarios del dominio)
4. Copiar la URL generada → esa es la URL de la app

---

## 👥 Roles de usuario

| Rol | Permisos |
|---|---|
| Super admin | Todo: usuarios, clientes, productos, reportes, órdenes |
| Vendedor | Crear y ver sus propias órdenes, Crear productos |
| Auxiliar | Ver órdenes, actualizar estados |
| Soporte | Ver órdenes, actualizar estados |
---

## 📊 Reporte Excel

El reporte XLSX descargable incluye:
- Filtros por fecha, estado, vendedor y cliente
- Previsualización en pantalla antes de descargar
- Hoja 1: detalle de órdenes con colores por estado
- Hoja 2: resumen por estado, vendedor y cliente

---

## 🤖 Desarrollo con Claude Code

Este proyecto usa `CLAUDE.md` como contexto persistente para Claude Code.
```bash
# Abrir sesión de desarrollo
cd Proyecto_OrdenPedido_VirtualCol && claude

# Ejecutar tarea específica sin interacción
claude -p "agrega validación de campos vacíos en nueva orden"
```

---

## 📋 Roadmap

- [x] Planeación y modelo de datos
- [x] CLAUDE.md con contexto completo
- [x] Codigo.gs — backend completo
- [x] Index.html — estructura SPA
- [x] Estilos.html — diseño UI
- [x] Javascript.html — lógica cliente
- [x] Trigger automático de vencimientos
- [ ] Módulo de reportes Excel
- [ ] PDF formato carta
- [ ] Pruebas y despliegue

---

## 📄 Licencia

Proyecto privado — Ventas Virtuales Colombia © 2025
