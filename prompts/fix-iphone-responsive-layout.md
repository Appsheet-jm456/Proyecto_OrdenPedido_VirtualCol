# 🔵 UX — CORREGIR LAYOUT RESPONSIVE EN IPHONE (CELULAR <768px)

## CONTEXTO:
En la vista móvil desde iPhone, el layout de dos columnas (sidebar + contenido principal) no se adapta correctamente. El sidebar con el logo ocupa demasiado espacio horizontal, empujando el contenido principal fuera de la pantalla. El botón "Cerrar sesión" no es visible en ninguna parte de la interfaz móvil. Las tarjetas de estado en la parte inferior se cortan. La tabla de órdenes y los filtros quedan parcialmente ocultos a la derecha.

## ARCHIVOS A MODIFICAR:
- `Estilos.html` (CSS media queries)
- `Index.html` (estructura HTML del sidebar y botón cerrar sesión)
- `Javascript.html` (toggle del menú móvil si se implementa hamburguesa)

═══════════════════════════════════════════
## SECCIÓN 1 — REESTRUCTURAR LAYOUT MOBILE EN Estilos.html
═══════════════════════════════════════════

Dentro del `@media (max-width: 768px)` en Estilos.html, aplicar los siguientes cambios:

### 1. Sidebar → oculto por defecto en mobile:
- El sidebar (`.sidebar` o el contenedor de la columna izquierda) debe tener `display: none` en mobile
- Se mostrará solo al tocar un botón hamburguesa (☰) en la barra superior
- Cuando se muestre, debe ser:
  ```css
  position: fixed;
  top: 0;
  left: 0;
  width: 80vw;
  max-width: 300px;
  height: 100vh;
  z-index: 1000;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.3);
  ```
- Agregar overlay oscuro detrás:
  ```css
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
    display: none;
  }
  ```

### 2. Logo en mobile:
- Dentro del sidebar, el logo debe tener `max-width: 120px; height: auto;`
- Eliminar el texto duplicado "Ventas Virtuales Colombia" que aparece al lado del logo en mobile — solo mostrar el logo
- Texto del nombre del negocio: `display: none` en mobile si ya está en el logo

### 3. Contenido principal → ancho completo:
- El contenedor principal (`.main-content` o columna derecha) debe ocupar `width: 100%; margin-left: 0;`
- Quitar cualquier `margin-left` o `padding-left` que compensaba el sidebar fijo en desktop

### 4. Barra de navegación superior (tabs):
- Los tabs (Órdenes de Pedido, Clientes, Usuarios, Reportes) deben ser scrollables horizontalmente:
  ```css
  .tabs-container {
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  ```
- Reducir font-size de tabs a `0.85rem` en mobile

### 5. Tarjetas de estado (barra inferior):
- Las 5 tarjetas de estado (Pendiente, Prestado, Por Cobrar/Dev, Facturado, Regresado) deben estar en una barra fija inferior:
  ```css
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  ```
- Layout: `display: flex; justify-content: space-around;`
- Cada tarjeta: `flex: 1; min-width: 0; padding: 6px 4px; font-size: 0.7rem;`
- Texto "Por Cobrar/Devolver" → abreviar a "Cobrar/Dev" en mobile
- Agregar `padding-bottom` al body para que el contenido no quede detrás de la barra fija

### 6. Tabla de órdenes → vista tarjetas en mobile:
- En mobile, NO mostrar tabla HTML estándar
- Mostrar vista tipo tarjetas (cards): cada orden como un div con la info apilada verticalmente:
  ```
  ┌─────────────────────────────┐
  │ OP-20260316-001        [🟠] │  ← número + badge estado
  │ Fecha: 2026-03-16           │
  │ Cliente: Nombre Local       │
  │ Vendedor: Juan              │
  │ Valor: $1,200,000           │
  │ Recibe: Nombre              │
  │ [  Ver / Gestionar  ]       │  ← botón amarillo ancho completo
  └─────────────────────────────┘
  ```
- Cada card:
  ```css
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 4px solid [color_del_estado];
  ```
- La tabla desktop se oculta con `display: none` y las cards se muestran con `display: block`
- En desktop (≥768px) las cards se ocultan y la tabla se muestra

### 7. Filtros en mobile:
- Los filtros de fecha y estado deben apilarse verticalmente (`flex-direction: column`)
- Cada input/select: `width: 100%; margin-bottom: 8px;`

═══════════════════════════════════════════
## SECCIÓN 2 — AGREGAR BOTÓN CERRAR SESIÓN VISIBLE EN Index.html
═══════════════════════════════════════════

### 1. Barra superior mobile:
Agregar estructura HTML:
```
┌──────────────────────────────────────┐
│ ☰  │  Órdenes de Pedido  │  [Salir] │
└──────────────────────────────────────┘
```
- Botón hamburguesa (☰) a la izquierda: abre/cierra sidebar
- Título de la sección activa al centro
- Botón "Cerrar sesión" a la derecha: ícono de salida + texto "Salir"
- Estilo del botón Salir:
  ```css
  background: transparent;
  color: #f44336;
  border: 1px solid #f44336;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.8rem;
  ```

### 2. Desktop:
El botón "Cerrar sesión" debe permanecer en su ubicación actual (dentro del sidebar o en la barra superior según el diseño actual)

### 3. Duplicar botón:
En mobile, si el botón "Cerrar sesión" existe dentro del sidebar, duplicarlo también en la barra superior para que siempre sea accesible sin abrir el menú

═══════════════════════════════════════════
## SECCIÓN 3 — LÓGICA DE TOGGLE SIDEBAR EN Javascript.html
═══════════════════════════════════════════

### 1. Función toggleSidebarMobile():
```javascript
// Alterna visibilidad del sidebar en vista móvil
function toggleSidebarMobile() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const abierto = sidebar.classList.toggle('sidebar-abierto');
  overlay.style.display = abierto ? 'block' : 'none';
  document.body.style.overflow = abierto ? 'hidden' : '';
}
```

### 2. Overlay:
Al hacer clic en el overlay debe cerrar el sidebar

### 3. Auto-cerrar:
Al seleccionar un filtro de estado desde el sidebar en mobile, cerrar automáticamente el sidebar después de aplicar el filtro

═══════════════════════════════════════════
## SECCIÓN 4 — MODALES EN MOBILE
═══════════════════════════════════════════

1. Los modales (Ver/Gestionar Orden, Nueva Orden, etc.) deben ocupar en mobile:
   ```css
   width: 100vw;
   height: 100vh;
   max-width: 100%;
   margin: 0;
   border-radius: 0;
   ```
2. El contenido del modal debe ser scrollable:
   ```css
   overflow-y: auto;
   -webkit-overflow-scrolling: touch;
   ```
3. Botón cerrar modal (X) visible y con área táctil mínima de `44px × 44px` (estándar Apple)

## RESULTADO ESPERADO:
- En iPhone (y cualquier pantalla <768px): el sidebar se oculta y aparece con botón hamburguesa, el logo no ocupa espacio innecesario, la tabla se muestra como tarjetas apiladas, el botón "Cerrar sesión" / "Salir" es visible en la barra superior, las tarjetas de estado se ven completas en la barra inferior fija, y los modales ocupan toda la pantalla.
- En desktop (≥1024px) y tablet (768-1023px): sin cambios, mantiene el layout actual de dos columnas.

Comentarios en español en todo el código.
No usar librerías externas.
