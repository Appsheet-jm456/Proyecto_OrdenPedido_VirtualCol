# CLAUDE.md — Sistema de Órdenes de Pedido Ventas Virtuales COL

## Contexto del negocio
App web full stack en Google Apps Script para gestionar órdenes de pedido 
de un local tech en Cali, Colombia. Distribuidores de otros locales piden 
equipos (torres, tiny PC, mini PC) y se lleva control de Prestado/Facturado/Regresado

## Stack técnico
- Backend: Google Apps Script (.gs)
- Frontend: HtmlService (HTML + CSS + JS en archivos .html separados)
- Base de datos: Google Sheets base de datos "1pvt1nDIKHwxSduUH8H0d3fglOfsuoSqJ2JrR9HPO5nk"
- Exportación: xlsx via Sheets API, PDF via window.print()

## Nombre del negocio
Ventas Virtuales Colombia 
Av 5 a # 23 D Norte  - 66  Ctro Comercial Pasarela Local 2 - 107
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
4. Orden_Pedido → id_op, numero_op,, id_cliente, id_vendedor, fecha, hora_creacion, estado, local_origen, observaciones
5. Detalle_Pedido → id_detalle, id_op, id_producto, descripcion_libre, cantidad, valor_unitario, valor_total, estado_item, hora_entrega, hora_regreso

## Estados de una orden
- Pendiente → recién creada, equipo aún en el local
- Entregado → equipo salió hacia el distribuidor (registra hora_entrega)
- Pago → distribuidor pagó
- Devolvio → equipo regresó (registra hora_regreso)

## Número de OP
Formato autogenerado: OP-YYYYMMDD-001 (correlativo por día)

## Roles de usuario
- Super admin: acceso total, gestión de usuarios, gestion de clientes
- vendedor: crear y ver sus propios pedidos
- Auxialiar: 

## Convenciones de código
- Comentarios en español
- Funciones en camelCase: crearOrden(), actualizarEstado()
- No usar librerías externas que requieran OAuth adicional
- Autenticación con PropertiesService (token de sesión)

## Colores UI
- Navbar: #ffcf22 (azul oscuro)
- Prestado: Verde  
- Facturado: Azul
- Regresado: Gris

## Comandos frecuentes
- Abrir Claude Code en este proyecto: cd Proyecto_OrdenPedido_VirtualCol && claude
- Ejecutar tarea sin interacción: claude -p "agrega validación de campos vacíos en el formulario de nueva orden"
