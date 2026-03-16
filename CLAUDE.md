 CLAUDE.md — Sistema de Órdenes de Pedido Ventas Virtuales COL
 
## Contexto del negocio
App web full stack en Google Apps Script para gestionar órdenes de pedido 
de un local tech en Cali, Colombia. Distribuidores de otros locales piden 
equipos (torres, tiny PC, mini PC) y se lleva control de Prestado/Facturado/Regresado.
 
## Stack técnico
- Backend: Google Apps Script (.gs)
- Frontend: HtmlService (HTML + CSS + JS en archivos .html separados)
- Base de datos: Google Sheets ID: 1pvt1nDIKHwxSduUH8H0d3fglOfsuoSqJ2JrR9HPO5nk
- Exportación: xlsx via Sheets API, PDF via window.print()
 
## Nombre del negocio
Ventas Virtuales Colombia
Av 5 a # 23 D Norte - 66 Ctro Comercial Pasarela Local 2 - 107
Celular: 3175591252
 
## Estructura del proyecto
- Codigo.gs → doGet(), doPost(), funciones CRUD del servidor
- Index.html → estructura SPA principal
- Estilos.html → todo el CSS (incluido con createHtmlOutputFromFile)
- Javascript.html → JavaScript del cliente
 
## Hojas de Google Sheets (tablas)
1. Usuarios → id_usuario, nombre, email, password_hash, rol, local_asignado, activo
2. Clientes → id_cliente, nombre_local, contacto, telefono, ciudad, created_at
3. Productos → id_producto, nombre, categoria, descripcion, precio_ref, activo
4. Orden_Pedido → id_op, numero_op, id_cliente, id_vendedor, nombre_receptor, fecha, hora_creacion,
   estado, local_origen, observaciones, fecha_prestamo, fecha_limite_devolucion,
   dias_habiles_prestamo, alerta_vencimiento
5. Detalle_Pedido → id_detalle, id_op, id_producto, descripcion_libre, cantidad,
   valor_unitario, valor_total, estado_item, hora_entrega, hora_regreso
 
## Estados de una orden
- Pendiente → recién creada, equipo aún en el local
- Prestado → equipo salió (registra fecha_prestamo y hora_entrega)
- Por Cobrar/Devolver → préstamo venció (cambio automático al superar días hábiles)
- Facturado → distribuidor pagó / se facturó
- Regresado → equipo regresó (registra hora_regreso)
 
## Regla de vencimiento de préstamo
- Días hábiles permitidos por defecto: 1 día hábil
- El sistema calcula fecha_limite_devolucion = fecha_prestamo + 1 día hábil
  (excluye sábados, domingos y festivos colombianos)
- Un trigger de tiempo en Apps Script revisa cada hora todos los pedidos en estado
  "Prestado" y si la fecha actual supera fecha_limite_devolucion, cambia el estado
  automáticamente a "Por Cobrar/Devolver"
- En la tabla principal ese estado se muestra con badge rojo parpadeante
- Se registra en columna alerta_vencimiento la fecha y hora del cambio automático
- Festivos colombianos hardcodeados en el archivo Codigo.gs como array FESTIVOS_CO
 
## Número de OP
Formato autogenerado: OP-YYYYMMDD-001 (correlativo por día)
 
## Roles de usuario
- Super admin: acceso total, gestión de usuarios, gestión de clientes, reportes
- Vendedor: crear y ver sus propios pedidos
- Auxiliar: ver pedidos, actualizar estado de órdenes asignadas
 
## Convenciones de código
- Comentarios en español
- Funciones en camelCase: crearOrden(), actualizarEstado(), verificarVencimientos()
- No usar librerías externas que requieran OAuth adicional
- Autenticación con PropertiesService (token de sesión)
- Trigger de tiempo: ScriptApp.newTrigger('verificarVencimientos').timeBased().everyHours(1)
 
## Colores UI
- Navbar: #ffcf22 (amarillo Ventas Virtuales Colombia)
- Texto navbar: #1a1a1a (negro)
- Pendiente: naranja #ff9800
- Prestado: verde #4caf50
- Por Cobrar/Devolver: rojo #f44336 (badge parpadeante con animación CSS pulse)
- Facturado: azul #2196f3
- Regresado: gris #9e9e9e
 
## Diseño Frontend — Pantallas
 
### Pantalla 1: Login
- Fondo blanco centrado, logo de Ventas Virtuales Colombia en la parte superior
- Debajo del logo: campo correo electrónico, campo contraseña
- Botón "Ingresar" color #ffcf22 con texto negro
- Mensaje de error si credenciales incorrectas
 
### Pantalla 2: Dashboard principal (después de login)
LAYOUT DE DOS COLUMNAS:
 
COLUMNA IZQUIERDA — sidebar fijo:
- Logo pequeño de Ventas Virtuales Colombia
- Título "Órdenes de Pedido"
- Tarjetas de estado tipo cuadrado apiladas verticalmente:
  * Pendiente (naranja) → muestra conteo
  * Prestado (verde) → muestra conteo
  * Por Cobrar/Devolver (rojo) → muestra conteo, parpadea si > 0
  * Facturado (azul) → muestra conteo
  * Regresado (gris) → muestra conteo
- Cada tarjeta es clickeable para filtrar la tabla
 
COLUMNA DERECHA — contenido principal:
- Barra de navegación superior con tabs:
  * Órdenes de Pedido (activo por defecto)
  * Clientes
  * Usuarios (solo visible para Super admin)
  * Reportes (visible para Super admin y Auxiliar)
- Botón "+ Nueva Orden" arriba a la derecha
- Tabla principal con columnas:
  | N° OP | Fecha | Cliente | Vendedor | Recibe | Valor | Hora | Estado | Acción |
 
  COLUMNA FECHA:
  - Muestra la fecha de creación de la orden (fecha de Orden_Pedido)
  - Si el estado es Prestado, muestra también fecha_limite_devolucion en rojo
 
  COLUMNA VENDEDOR:
  - Muestra el nombre del empleado interno que gestionó/entregó el pedido
 
  COLUMNA RECIBE:
  - Muestra el nombre_receptor (persona del local distribuidor que recibió físicamente el equipo)
 
  COLUMNA ACCIÓN — botón "Ver / Gestionar":
  - Botón amarillo #ffcf22 con ícono de lápiz o ojo
  - Al hacer clic abre modal de gestión de la orden
 
### Modal: Ver / Gestionar Orden
El modal se abre al hacer clic en el botón Acción de cualquier fila.
Estructura del modal:
 
SECCIÓN SUPERIOR — datos de la orden (solo lectura):
- N° OP, Fecha creación, Fecha préstamo, Fecha límite devolución
- Cliente / Local, Vendedor (empleado interno), Recibe (nombre_receptor), Local origen
- Tabla de productos del detalle:
  | Producto | Descripción | Cant | Valor unit | Valor total | Estado ítem |
- Valor total de la orden
- Observaciones
 
SECCIÓN INFERIOR — cambio de estado:
- Título "Actualizar estado de la orden"
- Estado actual mostrado como badge de color
- Botones de transición válidos según estado actual:
 
  Si estado = Pendiente:
    → botón verde "Marcar como Prestado"
    → al hacer clic aparece campo obligatorio "Nombre de quien recibe el equipo"
      que guarda en columna nombre_receptor de Orden_Pedido
    → registra fecha_prestamo y hora_entrega en Detalle_Pedido
 
  Si estado = Prestado o Por Cobrar/Devolver:
    → botón azul "Marcar como Facturado"
    → botón gris "Marcar como Regresado" (registra hora_regreso)
 
  Si estado = Facturado:
    → botón gris "Marcar como Regresado" (registra hora_regreso)
 
  Si estado = Regresado:
    → sin botones de cambio, mostrar mensaje "Orden cerrada"
 
- Campo de observaciones adicionales al cambiar estado (opcional)
- Botón "Guardar cambio" confirma la transición
- Botón "Cerrar" cierra el modal sin guardar
- Botón "Imprimir PDF" genera el PDF de la orden
 
### Pantalla 3: Nueva Orden (modal)
- Seleccionar cliente (buscador tipo autocomplete)
- Si el cliente no existe: enlace/botón "＋ Crear nuevo cliente" debajo del buscador
  que expande un mini-formulario inline con campos: nombre_local, contacto, telefono, ciudad
  y botón "Guardar cliente" (#ffcf22) que crea el cliente y lo selecciona automáticamente
- Campo "Entregado a / Recibe:" — texto libre con nombre de quien recibe el equipo (nombre_receptor)
- Local de origen
- Agregar productos (descripción libre + cantidad + valor)
- Botón agregar ítem, tabla de ítems con subtotal
- Observaciones
- Botón "Guardar Orden"
 
### Pantalla 4: Clientes (tab)
- Tabla de clientes con búsqueda
- Botón "+ Nuevo Cliente"
- Modal crear/editar cliente
 
### Pantalla 5: Usuarios (tab — solo Super admin)
- Tabla de usuarios con rol y estado activo/inactivo
- Botón "+ Nuevo Usuario"
- Modal crear/editar usuario
 
## Filtros dinámicos de tabla (client-side)
Barra de filtros encima de la tabla principal que filtran en tiempo real sin recargar:
- Campo texto: buscar por N° OP (búsqueda parcial)
- Campo texto: buscar por nombre de Cliente / Local
- Select dropdown: filtrar por Estado (Todos | Pendiente | Prestado | Por Cobrar/Devolver | Facturado | Regresado)
- Dos inputs date: Fecha desde / Fecha hasta (filtra por fecha de creación)
- Los filtros se combinan en AND
- Botón "Limpiar filtros" que resetea todos los campos
- Contador: "Mostrando X de Y órdenes"
 
## Campo nombre_receptor — Lógica de Vendedor vs Receptor
- id_vendedor / nombre_vendedor: empleado interno de Ventas Virtuales Colombia
  que creó y gestionó la orden (se toma del usuario en sesión)
- nombre_receptor: persona externa del local distribuidor que recibió físicamente
  el equipo. Campo de texto libre. Se solicita obligatoriamente al marcar "Prestado".
- Ambos campos se muestran en tabla principal, modal de gestión y PDF.
- La columna nombre_receptor se agrega en Orden_Pedido (después de id_vendedor).
 
## Lógica de vencimiento — función verificarVencimientos()
```javascript
// Pseudocódigo de la lógica en Codigo.gs
function verificarVencimientos() {
  // 1. Obtener todas las órdenes con estado "Prestado"
  // 2. Para cada orden calcular si hoy > fecha_limite_devolucion
  //    considerando solo días hábiles (excluir festivos colombianos)
  // 3. Si venció → actualizar estado a "Por Cobrar/Devolver"
  //    y registrar fecha/hora en columna alerta_vencimiento
  // 4. Esta función se ejecuta automáticamente cada hora via trigger
}
 
const FESTIVOS_CO = [
  "01-01", "06-01", "19-03", "01-05", "29-06", "20-07",
  "07-08", "18-08", "13-10", "03-11", "17-11", "08-12", "25-12"
  // Actualizar anualmente los festivos móviles
];
```
 
## Formato PDF / Impresión
- Tamaño carta (letter)
- Encabezado: logo, nombre, dirección, celular de Ventas Virtuales Colombia
- Cuerpo: datos de la orden, Vendedor (empleado), Recibe (nombre_receptor),
  fecha préstamo, fecha límite devolución, tabla de detalle
- Pie de página: fecha de impresión y estado actual
- CSS @media print optimizado
 
## Reporte Excel XLSX
 
### Acceso
- Tab "Reportes" visible en la barra de navegación superior para Super admin y Auxiliar
- Botón "Descargar Excel" color #ffcf22 con ícono de descarga
 
### Filtros dinámicos (se aplican antes de descargar)
- Rango de fechas: fecha inicio y fecha fin (fecha de creación de la orden)
- Estado: Todos | Pendiente | Prestado | Por Cobrar/Devolver | Facturado | Regresado
- Vendedor: dropdown con lista de vendedores activos
- Cliente / Local: buscador de texto libre
- Al cambiar cualquier filtro se actualiza en tiempo real una tabla de previsualización
  en pantalla antes de descargar
 
### Tabla de previsualización
Muestra los registros filtrados en pantalla con las mismas columnas del Excel:
| N° OP | Fecha | Cliente | Local origen | Vendedor | Recibe | Productos | Valor total |
| Hora entrega | Fecha límite | Estado | Fecha cambio estado | Observaciones |
- Contador de registros encontrados: "Mostrando X órdenes"
- Si no hay resultados muestra mensaje "No hay órdenes con estos filtros"
 
### Estructura del archivo Excel descargado
Nombre del archivo: Reporte_OP_VentasVirtuales_YYYYMMDD.xlsx
 
Hoja 1 — "Órdenes":
- Fila 1: título "Ventas Virtuales Colombia — Reporte de Órdenes de Pedido"
- Fila 2: rango de fechas del reporte y fecha de generación
- Fila 3: vacía (separador)
- Fila 4: encabezados de columna en negrita con fondo #ffcf22
- Filas 5 en adelante: datos filtrados, una orden por fila
- Columnas: N° OP, Fecha creación, Cliente, Local origen, Vendedor, Recibe (nombre_receptor),
  Descripción productos, Valor total, Hora entrega, Fecha límite devolución,
  Estado, Fecha cambio estado, Observaciones
- Filas de estado "Por Cobrar/Devolver" se colorean en rojo claro #ffcccc
- Filas de estado "Regresado" se colorean en gris claro #f5f5f5
 
Hoja 2 — "Resumen":
- Tabla resumen por estado con conteo y valor total acumulado:
  | Estado | Cantidad órdenes | Valor total |
- Tabla resumen por vendedor:
  | Vendedor | Órdenes creadas | Valor total gestionado |
- Tabla resumen por cliente/local:
  | Cliente | Órdenes | Valor total | Equipos pendientes de regreso |
 
### Implementación técnica
- Usar la clase Utilities y SpreadsheetApp de Apps Script para generar el xlsx
- Crear el archivo temporalmente en Google Drive con DriveApp
- Obtener como blob y enviarlo al cliente con ContentService para forzar descarga
- El frontend recibe la URL temporal y abre en nueva pestaña para descarga directa
- Eliminar el archivo temporal de Drive después de 5 minutos con un trigger de limpieza
 
### Función principal en Codigo.gs
```javascript
// Pseudocódigo
function generarReporteExcel(filtros) {
  // 1. Leer Orden_Pedido y Detalle_Pedido según filtros
  // 2. Crear SpreadsheetApp temporal en Drive
  // 3. Construir Hoja 1 con datos y estilos
  // 4. Construir Hoja 2 con resúmenes por estado, vendedor, cliente
  // 5. Retornar URL de descarga temporal
}
```

## Diseño Responsive — 3 Breakpoints
La app debe funcionar correctamente en Desktop, Tablet y Celular.
El celular es herramienta de uso frecuente en el local.

### Breakpoints definidos
- Desktop: ≥ 1024px
- Tablet: 768px – 1023px
- Celular: < 768px (prioridad alta)

### Desktop (≥ 1024px)
- Sidebar fijo izquierdo de 160px con cards de estado apiladas verticalmente
- Contenido principal con margin-left: 160px
- Tabla completa con todas las columnas visibles
- Modales centrados (500px / 700px para modal-grande)
- Filtros en fila horizontal

### Tablet (768px - 1023px)
- Sidebar reducido a 120px, cards con número + etiqueta pequeña
- Columna "Hora" oculta en la tabla de órdenes
- Filtros en grid 2x2
- Modales al 90% del ancho
- Navbar tabs con scroll horizontal

### Móvil (< 768px)
- Sidebar se convierte en barra inferior fija (bottom nav bar) de 64px
  con los 5 estados como iconos + número en fila horizontal
- Header y footer del sidebar ocultos
- Contenido principal con padding-bottom: 74px para no quedar detrás de la barra
- Botón "Nueva Orden" del navbar se oculta; aparece un FAB circular (56x56px)
  fijo en esquina inferior derecha con icono "+" en #ffcf22
- Tabla de órdenes oculta; se muestran cards apiladas verticalmente
  (contenedor: #cards-ordenes-mobile, clase: .cards-mobile)
- Cada card muestra: N° OP + badge estado (header), fecha, cliente, vendedor,
  receptor (si existe), límite (si prestado), botón "Ver"
- Modales a pantalla completa (100% width/height, border-radius: 0)
  con header/footer sticky y body con scroll
- Filtros apilados en una columna
- Forms en una columna
- Todos los inputs/botones con min-height: 44px (touch-friendly)
- Tablas de clientes/usuarios con scroll horizontal

### Archivos afectados
- CSS.html: media queries para tablet y móvil, estilos de .cards-mobile y .fab-nueva-orden
- Index.html: div#cards-ordenes-mobile junto a la tabla, botón.fab-nueva-orden en dashboard
- Javascript.html: renderizarOrdenes() genera tanto filas <tr> como cards mobile
## Comandos frecuentes
- Abrir Claude Code en este proyecto: cd Proyecto_OrdenPedido_VirtualCol && claude
- Ejecutar tarea específica: claude -p "agrega validación de campos vacíos en el formulario de nueva orden"
 
