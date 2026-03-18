// ============================================================
// Codigo.gs — Sistema de Órdenes de Pedido Ventas Virtuales COL
// ============================================================

// ID de la hoja de cálculo (base de datos)
var SPREADSHEET_ID = '1pvt1nDIKHwxSduUH8H0d3fglOfsuoSqJ2JrR9HPO5nk';

// Festivos colombianos (MM-DD) — actualizar anualmente los festivos móviles
var FESTIVOS_CO = [
  '01-01', '01-06', '03-24', '04-17', '04-18', '05-01',
  '06-02', '06-23', '06-30', '07-20', '08-07', '08-18',
  '10-13', '11-03', '11-17', '12-08', '12-25'
];

// Estados válidos de una orden
var ESTADOS = {
  PENDIENTE: 'Pendiente',
  PRESTADO: 'Prestado',
  POR_COBRAR: 'Por Cobrar/Devolver',
  FACTURADO: 'Facturado',
  REGRESADO: 'Regresado'
};

// ============================================================
// FUNCIÓN PRINCIPAL: Crear todas las tablas (hojas) en el Sheet
// Ejecutar UNA SOLA VEZ desde el editor de Apps Script
// ============================================================
function crearTablas() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Definición de todas las tablas con sus encabezados
  var tablas = {
    'Usuarios': [
      'id_usuario',
      'nombre',
      'email',
      'password_hash',
      'rol',
      'local_asignado',
      'activo',
      'created_at'
    ],
    'Clientes': [
      'id_cliente',
      'nombre_local',
      'contacto',
      'telefono',
      'ciudad',
      'created_at'
    ],
    'Productos': [
      'id_producto',
      'nombre',
      'categoria',
      'descripcion',
      'precio_ref',
      'activo'
    ],
    'Orden_Pedido': [
      'id_op',
      'numero_op',
      'id_cliente',
      'id_vendedor',
      'fecha',
      'hora_creacion',
      'estado',
      'local_origen',
      'observaciones',
      'fecha_prestamo',
      'fecha_limite_devolucion',
      'dias_habiles_prestamo',
      'alerta_vencimiento',
      'nombre_receptor',
      'valor_total'
    ],
    'Detalle_Pedido': [
      'id_detalle',
      'id_op',
      'id_producto',
      'descripcion_libre',
      'cantidad',
      'valor_unitario',
      'valor_total',
      'estado_item',
      'hora_entrega',
      'hora_regreso'
    ]
  };

  var nombresTablas = Object.keys(tablas);

  for (var i = 0; i < nombresTablas.length; i++) {
    var nombreHoja = nombresTablas[i];
    var encabezados = tablas[nombreHoja];

    // Verificar si la hoja ya existe
    var hoja = ss.getSheetByName(nombreHoja);

    if (!hoja) {
      // Crear nueva hoja
      hoja = ss.insertSheet(nombreHoja);
      Logger.log('Hoja creada: ' + nombreHoja);
    } else {
      // Limpiar hoja existente
      hoja.clear();
      Logger.log('Hoja existente limpiada: ' + nombreHoja);
    }

    // Escribir encabezados en la fila 1
    var rangoEncabezados = hoja.getRange(1, 1, 1, encabezados.length);
    rangoEncabezados.setValues([encabezados]);

    // Estilo de encabezados: fondo amarillo #ffcf22, negrita, texto centrado
    rangoEncabezados.setBackground('#ffcf22');
    rangoEncabezados.setFontWeight('bold');
    rangoEncabezados.setHorizontalAlignment('center');
    rangoEncabezados.setFontColor('#1a1a1a');

    // Congelar la fila de encabezados
    hoja.setFrozenRows(1);

    // Ajustar ancho de columnas automáticamente
    for (var j = 1; j <= encabezados.length; j++) {
      hoja.autoResizeColumn(j);
    }
  }

  // Eliminar la hoja por defecto "Hoja 1" si existe
  var hojaDefault = ss.getSheetByName('Hoja 1');
  if (hojaDefault && ss.getNumSheets() > 1) {
    ss.deleteSheet(hojaDefault);
    Logger.log('Hoja por defecto "Hoja 1" eliminada');
  }

  // También intentar eliminar "Sheet1" (nombre en inglés)
  var sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1 && ss.getNumSheets() > 1) {
    ss.deleteSheet(sheet1);
    Logger.log('Hoja por defecto "Sheet1" eliminada');
  }

  Logger.log('=== Todas las tablas fueron creadas exitosamente ===');
  return 'Tablas creadas: ' + nombresTablas.join(', ');
}

// ============================================================
// Crear hoja "Configuracion" con datos del negocio
// Ejecutar UNA SOLA VEZ para inicializar la configuración
// ============================================================
function crearHojaConfiguracion() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Configuracion');

  if (!hoja) {
    hoja = ss.insertSheet('Configuracion');
    Logger.log('Hoja Configuracion creada');
  } else {
    hoja.clear();
    Logger.log('Hoja Configuracion limpiada');
  }

  // Encabezados
  var encabezados = ['parametro', 'valor', 'descripcion'];
  hoja.getRange(1, 1, 1, 3).setValues([encabezados]);
  hoja.getRange(1, 1, 1, 3).setBackground('#ffcf22').setFontWeight('bold')
    .setHorizontalAlignment('center').setFontColor('#1a1a1a');
  hoja.setFrozenRows(1);

  // Datos iniciales del negocio
  var datos = [
    ['nombre_comercial', 'Ventas Virtuales Colombia', 'Nombre visible del negocio'],
    ['direccion', 'Av 5 a # 23 D Norte - 66 Ctro Comercial Pasarela Local 2 - 107', 'Dirección física'],
    ['nombre_juridico', 'Rafael Alfonso Perez Chavarro', 'Nombre persona jurídica'],
    ['correo', 'rafyta1995@gmail.com', 'Correo de contacto'],
    ['celular', '3175591252', 'Celular de contacto'],
    ['logo_url', 'https://i.postimg.cc/mrb100Sv/Logo-PNG.png', 'URL pública del logo'],
    ['ciudad', 'Cali, Colombia', 'Ciudad del negocio']
  ];

  hoja.getRange(2, 1, datos.length, 3).setValues(datos);

  // Ajustar ancho de columnas
  for (var j = 1; j <= 3; j++) {
    hoja.autoResizeColumn(j);
  }

  Logger.log('Hoja Configuracion creada con datos iniciales');
  return 'Hoja Configuracion creada exitosamente';
}

// ============================================================
// Leer configuración del negocio desde hoja Configuracion
// Retorna objeto clave-valor con todos los parámetros
// ============================================================
function getConfiguracion() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Configuracion');

  if (!hoja) {
    // Retornar valores por defecto si la hoja no existe
    return {
      nombre_comercial: 'Ventas Virtuales Colombia',
      direccion: 'Av 5 a # 23 D Norte - 66 Ctro Comercial Pasarela Local 2 - 107',
      nombre_juridico: 'Rafael Alfonso Perez Chavarro',
      correo: 'rafyta1995@gmail.com',
      celular: '3175591252',
      logo_url: 'https://i.postimg.cc/mrb100Sv/Logo-PNG.png',
      ciudad: 'Cali, Colombia'
    };
  }

  var datos = hoja.getDataRange().getValues();
  var config = {};

  // Saltar fila 1 (encabezados), recorrer desde fila 2
  for (var i = 1; i < datos.length; i++) {
    if (datos[i][0]) {
      config[datos[i][0]] = datos[i][1] !== undefined ? String(datos[i][1]) : '';
    }
  }

  return config;
}

// ============================================================
// Actualizar un parámetro de configuración
// Busca la fila donde columna A === parametro y actualiza columna B
// ============================================================
function actualizarConfiguracion(parametro, valor) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Configuracion');

  if (!hoja) {
    return { ok: false, mensaje: 'Hoja Configuracion no encontrada' };
  }

  var datos = hoja.getDataRange().getValues();

  for (var i = 1; i < datos.length; i++) {
    if (datos[i][0] === parametro) {
      hoja.getRange(i + 1, 2).setValue(valor);
      return { ok: true };
    }
  }

  return { ok: false, mensaje: 'Parámetro no encontrado: ' + parametro };
}

// ============================================================
// Insertar usuario Super Admin por defecto
// Ejecutar después de crearTablas()
// ============================================================
function crearUsuarioAdmin() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Usuarios');

  if (!hoja) {
    Logger.log('Error: la hoja Usuarios no existe. Ejecuta crearTablas() primero.');
    return;
  }

  // Crear hash simple de la contraseña
  var passwordHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    'admin123'
  ).map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');

  // Verificar si ya hay datos (aparte del encabezado)
  var ultimaFila = hoja.getLastRow();

  if (ultimaFila > 1) {
    // Ya existen usuarios, actualizar el primero para que sea admin con el correo correcto
    hoja.getRange(2, 1, 1, 8).setValues([[
      1,
      'Administrador',
      'appsheetjm@gmail.com',
      passwordHash,
      'Super admin',
      'Principal',
      'Sí',
      new Date().toISOString()
    ]]);
    Logger.log('Usuario Admin actualizado. Email: appsheetjm@gmail.com / Pass: admin123');
    return 'Admin actualizado exitosamente';
  }

  var adminData = [
    1,                                    // id_usuario
    'Administrador',                      // nombre
    'appsheetjm@gmail.com',              // email
    passwordHash,                         // password_hash
    'Super admin',                        // rol
    'Principal',                          // local_asignado
    'Sí',                                 // activo
    new Date().toISOString()              // created_at
  ];

  hoja.getRange(2, 1, 1, adminData.length).setValues([adminData]);
  Logger.log('Usuario Super Admin creado. Email: appsheetjm@gmail.com / Pass: admin123');
  return 'Admin creado exitosamente';
}

// ============================================================
// Función de emergencia: resetear usuario admin
// Ejecutar si no puedes acceder al sistema
// ============================================================
function resetearAdmin() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Usuarios');

  if (!hoja) {
    Logger.log('Error: la hoja Usuarios no existe.');
    return;
  }

  var passwordHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    'admin123'
  ).map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');

  // Buscar si existe el usuario con ese email
  var datos = hoja.getDataRange().getValues();
  var encontrado = false;

  for (var i = 1; i < datos.length; i++) {
    if (datos[i][2] === 'appsheetjm@gmail.com') {
      // Actualizar password y asegurar que esté activo
      hoja.getRange(i + 1, 4).setValue(passwordHash);  // password_hash
      hoja.getRange(i + 1, 5).setValue('Super admin');  // rol
      hoja.getRange(i + 1, 7).setValue('Sí');           // activo
      encontrado = true;
      Logger.log('Admin reseteado en fila ' + (i + 1));
      break;
    }
  }

  if (!encontrado) {
    // Crear nuevo admin
    var ultimaFila = hoja.getLastRow();
    var nuevoId = ultimaFila;
    hoja.appendRow([
      nuevoId,
      'Administrador',
      'appsheetjm@gmail.com',
      passwordHash,
      'Super admin',
      'Principal',
      'Sí',
      new Date().toISOString()
    ]);
    Logger.log('Nuevo admin creado');
  }

  Logger.log('=== Listo. Ingresa con: appsheetjm@gmail.com / admin123 ===');
  return 'Admin reseteado. Email: appsheetjm@gmail.com / Pass: admin123';
}

// ============================================================
// Migración: agregar columna nombre_receptor a Orden_Pedido
// Ejecutar UNA VEZ si la hoja ya existe sin esa columna
// ============================================================
function agregarColumnaNombreReceptor() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Orden_Pedido');
  if (!hoja) {
    Logger.log('Hoja Orden_Pedido no existe');
    return;
  }

  var encabezados = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  // Verificar si la columna ya existe
  if (encabezados.indexOf('nombre_receptor') !== -1) {
    Logger.log('Columna nombre_receptor ya existe');
    return 'La columna ya existe';
  }

  // Agregar encabezado en la siguiente columna
  var nuevaCol = encabezados.length + 1;
  var celda = hoja.getRange(1, nuevaCol);
  celda.setValue('nombre_receptor');
  celda.setBackground('#ffcf22');
  celda.setFontWeight('bold');
  celda.setHorizontalAlignment('center');
  celda.setFontColor('#1a1a1a');

  Logger.log('Columna nombre_receptor agregada en posición ' + nuevaCol);
  return 'Columna nombre_receptor agregada exitosamente';
}

// ============================================================
// Migración: agregar columna valor_total a Orden_Pedido
// Ejecutar UNA VEZ si la hoja ya existe sin esa columna
// ============================================================
function agregarColumnaValorTotal() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Orden_Pedido');
  if (!hoja) {
    Logger.log('Hoja Orden_Pedido no existe');
    return;
  }

  var encabezados = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  // Verificar si la columna ya existe
  if (encabezados.indexOf('valor_total') !== -1) {
    Logger.log('Columna valor_total ya existe');
    return 'La columna ya existe';
  }

  // Agregar encabezado en la siguiente columna
  var nuevaCol = encabezados.length + 1;
  var celda = hoja.getRange(1, nuevaCol);
  celda.setValue('valor_total');
  celda.setBackground('#ffcf22');
  celda.setFontWeight('bold');
  celda.setHorizontalAlignment('center');
  celda.setFontColor('#1a1a1a');

  Logger.log('Columna valor_total agregada en posición ' + nuevaCol);
  return 'Columna valor_total agregada exitosamente';
}

// ============================================================
// Recalcular valor_total de todas las órdenes existentes
// Suma valor_total de Detalle_Pedido para cada orden
// Ejecutar UNA VEZ después de agregarColumnaValorTotal()
// ============================================================
function recalcularValoresTotales() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hojaOP = ss.getSheetByName('Orden_Pedido');
  var hojaDetalle = ss.getSheetByName('Detalle_Pedido');

  if (!hojaOP || !hojaDetalle) {
    Logger.log('Error: hojas no encontradas');
    return;
  }

  var datosOP = hojaOP.getDataRange().getValues();
  var datosDetalle = hojaDetalle.getDataRange().getValues();
  var encabezadosOP = datosOP[0];

  // Buscar índice de la columna valor_total en Orden_Pedido
  var colValorTotal = encabezadosOP.indexOf('valor_total');
  if (colValorTotal === -1) {
    Logger.log('Columna valor_total no existe. Ejecuta agregarColumnaValorTotal() primero.');
    return;
  }

  // Construir mapa de totales por id_op desde Detalle_Pedido
  // Columnas en Detalle_Pedido: 0=id_detalle, 1=id_op, 6=valor_total
  var totalesPorOrden = {};
  for (var d = 1; d < datosDetalle.length; d++) {
    var idOp = String(datosDetalle[d][1]);
    var valorItem = Number(datosDetalle[d][6]) || 0;
    totalesPorOrden[idOp] = (totalesPorOrden[idOp] || 0) + valorItem;
  }

  // Actualizar cada orden con su valor_total calculado
  var actualizadas = 0;
  for (var i = 1; i < datosOP.length; i++) {
    var idOrden = String(datosOP[i][0]);
    var valorCalculado = totalesPorOrden[idOrden] || 0;
    hojaOP.getRange(i + 1, colValorTotal + 1).setValue(valorCalculado);
    actualizadas++;
  }

  Logger.log('Valores recalculados para ' + actualizadas + ' órdenes');
  return 'Recalculadas ' + actualizadas + ' órdenes';
}

// ============================================================
// Migración: convertir id_op numérico a UUID alfanumérico
// EJECUTAR UNA SOLA VEZ desde el editor de Apps Script
// Actualiza Orden_Pedido (col A) y Detalle_Pedido (col B)
// ============================================================
function migracionIdOp() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hojaOP = ss.getSheetByName('Orden_Pedido');
  var hojaDetalle = ss.getSheetByName('Detalle_Pedido');

  if (!hojaOP || !hojaDetalle) {
    Logger.log('Error: hojas no encontradas');
    return;
  }

  var datosOP = hojaOP.getDataRange().getValues();
  var datosDetalle = hojaDetalle.getDataRange().getValues();
  var migradas = 0;

  for (var i = 1; i < datosOP.length; i++) {
    var idActual = datosOP[i][0];

    // Solo migrar si el id_op actual es numérico (no UUID)
    if (idActual === '' || idActual === null || idActual === undefined) continue;
    var idStr = String(idActual);

    // Si ya parece UUID (contiene letras), saltar
    if (/[A-Za-z]/.test(idStr)) continue;

    // Generar nuevo UUID para esta orden
    var nuevoUuid = generarIdUnico();

    // Actualizar id_op en Orden_Pedido (columna A)
    hojaOP.getRange(i + 1, 1).setValue(nuevoUuid);

    // Actualizar id_op FK en todas las filas de Detalle_Pedido que coincidan
    for (var d = 1; d < datosDetalle.length; d++) {
      if (String(datosDetalle[d][1]) === idStr) {
        hojaDetalle.getRange(d + 1, 2).setValue(nuevoUuid);
        datosDetalle[d][1] = nuevoUuid; // Actualizar en memoria para evitar re-migración

        // También migrar id_detalle si es numérico
        var idDetalleActual = String(datosDetalle[d][0]);
        if (!/[A-Za-z]/.test(idDetalleActual)) {
          var nuevoIdDetalle = generarIdUnico();
          hojaDetalle.getRange(d + 1, 1).setValue(nuevoIdDetalle);
        }
      }
    }

    migradas++;
    Logger.log('Orden migrada: ' + idStr + ' → ' + nuevoUuid);
  }

  Logger.log('=== Migración completada. Órdenes migradas: ' + migradas + ' ===');
  return 'Migración completada: ' + migradas + ' órdenes actualizadas a UUID';
}

// ============================================================
// Función de inicialización completa
// Ejecutar esta para configurar todo de una vez
// ============================================================
function inicializarSistema() {
  Logger.log('=== Iniciando configuración del sistema ===');

  // Paso 1: Crear tablas
  crearTablas();

  // Paso 2: Crear usuario admin
  crearUsuarioAdmin();

  // Paso 3: Configurar trigger de vencimientos
  configurarTriggerVencimientos();

  Logger.log('=== Sistema inicializado correctamente ===');
  return 'Sistema inicializado correctamente';
}

// ============================================================
// WEB APP: doGet — Punto de entrada principal
// ============================================================
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Ventas Virtuales Colombia — Órdenes de Pedido')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Función para incluir archivos HTML parciales (CSS, JS)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================================
// AUTENTICACIÓN
// ============================================================
function autenticarUsuario(email, password) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Usuarios');
  var datos = hoja.getDataRange().getValues();

  var passwordHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password
  ).map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');

  for (var i = 1; i < datos.length; i++) {
    var fila = datos[i];
    if (fila[2] === email && fila[3] === passwordHash && fila[6] === 'Sí') {
      // Generar token de sesión
      var token = Utilities.getUuid();
      var userProps = PropertiesService.getUserProperties();
      userProps.setProperty('session_' + token, JSON.stringify({
        id_usuario: fila[0],
        nombre: fila[1],
        email: fila[2],
        rol: fila[4],
        local_asignado: fila[5]
      }));

      return {
        success: true,
        token: token,
        usuario: {
          id_usuario: fila[0],
          nombre: fila[1],
          email: fila[2],
          rol: fila[4],
          local_asignado: fila[5]
        }
      };
    }
  }

  return { success: false, mensaje: 'Credenciales incorrectas o usuario inactivo' };
}

function validarSesion(token) {
  var userProps = PropertiesService.getUserProperties();
  var sesion = userProps.getProperty('session_' + token);
  if (sesion) {
    return { success: true, usuario: JSON.parse(sesion) };
  }
  return { success: false };
}

function cerrarSesion(token) {
  var userProps = PropertiesService.getUserProperties();
  userProps.deleteProperty('session_' + token);
  return { success: true };
}

// ============================================================
// CRUD — CLIENTES
// ============================================================
function obtenerClientes() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Clientes');
  var datos = hoja.getDataRange().getValues();
  var encabezados = datos[0];
  var resultado = [];

  for (var i = 1; i < datos.length; i++) {
    var obj = {};
    for (var j = 0; j < encabezados.length; j++) {
      obj[encabezados[j]] = datos[i][j];
    }
    resultado.push(obj);
  }
  return resultado;
}

function crearCliente(datos) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Clientes');
  var ultimaFila = hoja.getLastRow();
  var nuevoId = ultimaFila; // El ID es el número de fila - 1

  var fila = [
    nuevoId,
    datos.nombre_local,
    datos.contacto,
    datos.telefono,
    datos.ciudad,
    new Date().toISOString()
  ];

  hoja.appendRow(fila);
  return { success: true, id_cliente: nuevoId };
}

// ============================================================
// CRUD — PRODUCTOS
// ============================================================

// Obtener solo productos activos (para autocomplete en órdenes)
function obtenerProductos() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Productos');
  var datos = hoja.getDataRange().getValues();
  var encabezados = datos[0];
  var resultado = [];

  for (var i = 1; i < datos.length; i++) {
    var obj = {};
    for (var j = 0; j < encabezados.length; j++) {
      obj[encabezados[j]] = datos[i][j];
    }
    if (obj.activo === 'Sí') {
      resultado.push(obj);
    }
  }
  return resultado;
}

// Obtener todos los productos (activos e inactivos) para gestión admin
function listarProductos() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Productos');
  var datos = hoja.getDataRange().getValues();
  var encabezados = datos[0];
  var resultado = [];

  for (var i = 1; i < datos.length; i++) {
    var obj = {};
    for (var j = 0; j < encabezados.length; j++) {
      obj[encabezados[j]] = datos[i][j];
    }
    // Saltar filas vacías
    if (obj.id_producto || obj.id_producto === 0) {
      resultado.push(obj);
    }
  }
  return resultado;
}

// Crear nuevo producto
function crearProducto(datos) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Productos');
  var ultimaFila = hoja.getLastRow();
  var nuevoId = ultimaFila; // ID = número de fila - 1

  var fila = [
    nuevoId,
    datos.nombre,
    datos.categoria || '',
    datos.descripcion || '',
    datos.precio_ref || 0,
    datos.activo || 'Sí'
  ];

  hoja.appendRow(fila);
  return { success: true, id_producto: nuevoId };
}

// Actualizar producto existente
function actualizarProducto(idProducto, datos) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Productos');
  var filas = hoja.getDataRange().getValues();

  for (var i = 1; i < filas.length; i++) {
    if (String(filas[i][0]) === String(idProducto)) {
      var fila = i + 1; // Fila en la hoja (1-indexed)
      hoja.getRange(fila, 2).setValue(datos.nombre);
      hoja.getRange(fila, 3).setValue(datos.categoria || '');
      hoja.getRange(fila, 4).setValue(datos.descripcion || '');
      hoja.getRange(fila, 5).setValue(datos.precio_ref || 0);
      hoja.getRange(fila, 6).setValue(datos.activo || 'Sí');
      return { success: true };
    }
  }
  return { success: false, mensaje: 'Producto no encontrado' };
}

// Desactivar producto (soft-delete)
function desactivarProducto(idProducto) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Productos');
  var filas = hoja.getDataRange().getValues();

  for (var i = 1; i < filas.length; i++) {
    if (String(filas[i][0]) === String(idProducto)) {
      var fila = i + 1;
      hoja.getRange(fila, 6).setValue('No'); // columna activo
      return { success: true };
    }
  }
  return { success: false, mensaje: 'Producto no encontrado' };
}

// ============================================================
// GENERADOR DE ID ÚNICO (UUID alfanumérico de 12 caracteres)
// ============================================================
function generarIdUnico() {
  // Genera ID alfanumérico único de 12 caracteres en mayúsculas
  // Ejemplo resultado: "A3F9B2C1D4E5"
  return Utilities.getUuid().replace(/-/g, '').substring(0, 12).toUpperCase();
}

// ============================================================
// CRUD — ÓRDENES DE PEDIDO
// ============================================================
// Generar número de OP usando el consecutivo controlado en la hoja Configuracion
// Formato: OP-YYYYMMDD-NNN donde NNN es el consecutivo global con padding de 3+ dígitos
// Usa LockService para evitar duplicados por concurrencia
// Lanza error si el rango de consecutivos se agotó
function generarNumeroOP() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Esperar hasta 10 segundos para obtener el lock

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var hojaConfig = ss.getSheetByName('Configuracion');

    // Leer parámetros de consecutivo desde la hoja Configuracion
    var inicio = 1, fin = 500, actual = 0, filaActual = -1;
    if (hojaConfig) {
      var datos = hojaConfig.getDataRange().getValues();
      for (var i = 1; i < datos.length; i++) {
        var param = String(datos[i][0]);
        var val = parseInt(datos[i][1], 10) || 0;
        if (param === 'consecutivo_inicio') inicio = val || 1;
        if (param === 'consecutivo_fin')    fin    = val || 500;
        if (param === 'consecutivo_actual') { actual = val; filaActual = i + 1; }
      }
    }

    // Determinar el siguiente número a usar
    // Si actual es 0 o menor que inicio, usar inicio; si no, incrementar actual
    var siguiente = (actual === 0 || actual < inicio) ? inicio : actual + 1;

    // Verificar que no supere el límite de la resolución
    if (siguiente > fin) {
      lock.releaseLock();
      throw new Error('RANGO_AGOTADO: El rango de consecutivos se agotó (máximo: ' + fin + '). Contacte al administrador para reiniciar o ampliar el rango.');
    }

    // Actualizar consecutivo_actual en la hoja Configuracion (dentro del lock)
    if (hojaConfig && filaActual > 0) {
      hojaConfig.getRange(filaActual, 2).setValue(siguiente);
    }

    lock.releaseLock();

    // Construir número OP con fecha actual (Colombia) y consecutivo con padding mínimo de 3 dígitos
    var hoy = new Date();
    var fechaStr = Utilities.formatDate(hoy, 'America/Bogota', 'yyyyMMdd');
    var numStr = String(siguiente);
    while (numStr.length < 3) numStr = '0' + numStr;
    return 'OP-' + fechaStr + '-' + numStr;

  } catch (e) {
    // Liberar el lock en caso de error y relanzar
    try { lock.releaseLock(); } catch(ignored) {}
    throw e;
  }
}

function crearOrden(datosOrden, detalleItems) {
  try {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hojaOP = ss.getSheetByName('Orden_Pedido');
  var hojaDetalle = ss.getSheetByName('Detalle_Pedido');

  // Generar UUID alfanumérico como id_op (llave primaria única)
  var nuevoIdOP = generarIdUnico();
  var numeroOP = generarNumeroOP(); // Puede lanzar error si rango agotado

  var ahora = new Date();
  var fecha = Utilities.formatDate(ahora, 'America/Bogota', 'yyyy-MM-dd');
  var hora = Utilities.formatDate(ahora, 'America/Bogota', 'HH:mm:ss');

  // Calcular valor total de la orden sumando los ítems del detalle
  var valorTotalOrden = 0;
  for (var t = 0; t < detalleItems.length; t++) {
    valorTotalOrden += (detalleItems[t].cantidad || 0) * (detalleItems[t].valor_unitario || 0);
  }

  // Insertar orden con id_op UUID
  var filaOrden = [
    nuevoIdOP,                    // id_op (UUID alfanumérico)
    numeroOP,                     // numero_op (OP-YYYYMMDD-NNN visible)
    datosOrden.id_cliente,        // id_cliente
    datosOrden.id_vendedor,       // id_vendedor
    fecha,                        // fecha
    hora,                         // hora_creacion
    ESTADOS.PENDIENTE,            // estado
    datosOrden.local_origen,      // local_origen
    datosOrden.observaciones || '',// observaciones
    '',                           // fecha_prestamo
    '',                           // fecha_limite_devolucion
    1,                            // dias_habiles_prestamo (por defecto 1)
    '',                           // alerta_vencimiento
    datosOrden.nombre_receptor || '', // nombre_receptor (quien recibe el equipo)
    valorTotalOrden               // valor_total
  ];

  hojaOP.appendRow(filaOrden);

  // Insertar detalle de cada ítem con id_detalle UUID y FK id_op UUID
  for (var i = 0; i < detalleItems.length; i++) {
    var item = detalleItems[i];
    var idDetalle = generarIdUnico(); // UUID único para cada ítem
    var valorTotal = (item.cantidad || 0) * (item.valor_unitario || 0);

    var filaDetalle = [
      idDetalle,                       // id_detalle (UUID)
      nuevoIdOP,                       // id_op (FK → Orden_Pedido, UUID)
      item.id_producto || '',          // id_producto (FK → Productos, o vacío si texto libre)
      item.descripcion_libre || '',    // descripcion_libre
      item.cantidad || 0,              // cantidad
      item.valor_unitario || 0,        // valor_unitario
      valorTotal,                      // valor_total
      ESTADOS.PENDIENTE,               // estado_item
      '',                              // hora_entrega
      ''                               // hora_regreso
    ];

    hojaDetalle.appendRow(filaDetalle);
  }

  return { success: true, numero_op: numeroOP, id_op: nuevoIdOP };

  } catch (e) {
    // Retornar error estructurado en vez de lanzar excepción al frontend
    return { success: false, error: e.message };
  }
}

// ============================================================
// Retorna información del estado actual del consecutivo de OP
// ============================================================
function obtenerInfoConsecutivo() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hojaConfig = ss.getSheetByName('Configuracion');

  var inicio = 1, fin = 500, actual = 0;
  if (hojaConfig) {
    var datos = hojaConfig.getDataRange().getValues();
    for (var i = 1; i < datos.length; i++) {
      var param = String(datos[i][0]);
      var val = parseInt(datos[i][1], 10) || 0;
      if (param === 'consecutivo_inicio') inicio = val || 1;
      if (param === 'consecutivo_fin')    fin    = val || 500;
      if (param === 'consecutivo_actual') actual = val;
    }
  }

  var rango = fin - inicio + 1;
  var usados = (actual === 0 || actual < inicio) ? 0 : (actual - inicio + 1);
  var disponibles = fin - (actual === 0 ? inicio - 1 : Math.max(actual, inicio - 1));
  var porcentajeUso = rango > 0 ? Math.round((usados / rango) * 100) : 0;

  return {
    inicio: inicio,
    fin: fin,
    actual: actual,
    usados: usados,
    disponibles: disponibles,
    porcentajeUso: porcentajeUso
  };
}

// ============================================================
// Reiniciar consecutivo: pone consecutivo_actual en 0
// Solo accesible para Super admin (validación en frontend; en producción validar sesión)
// ============================================================
function reiniciarConsecutivo() {
  var resultado = actualizarConfiguracion('consecutivo_actual', 0);
  if (resultado.ok) {
    var info = obtenerInfoConsecutivo();
    return { ok: true, mensaje: 'Consecutivo reiniciado. La siguiente OP usará el número: ' + info.inicio };
  }
  return { ok: false, mensaje: resultado.mensaje || 'Error al reiniciar el consecutivo.' };
}

// ============================================================
// Actualizar rango de consecutivos (inicio y fin)
// Valida que sean enteros positivos y que inicio < fin
// ============================================================
function actualizarRangoConsecutivo(inicio, fin) {
  inicio = parseInt(inicio, 10);
  fin    = parseInt(fin,    10);

  if (isNaN(inicio) || isNaN(fin) || inicio < 1 || fin < 1) {
    return { ok: false, mensaje: 'Los valores deben ser números enteros positivos.' };
  }
  if (inicio >= fin) {
    return { ok: false, mensaje: 'El inicio debe ser menor que el fin.' };
  }

  var r1 = actualizarConfiguracion('consecutivo_inicio', inicio);
  var r2 = actualizarConfiguracion('consecutivo_fin',    fin);

  if (r1.ok && r2.ok) {
    return { ok: true, mensaje: 'Rango guardado: ' + inicio + ' — ' + fin };
  }
  return { ok: false, mensaje: 'Error al guardar. Verifique que los parámetros existan en la hoja Configuracion.' };
}

function obtenerOrdenes(filtros) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var hojaOP = ss.getSheetByName('Orden_Pedido');
    var hojaClientes = ss.getSheetByName('Clientes');
    var hojaUsuarios = ss.getSheetByName('Usuarios');

    // Validar que las hojas existan
    if (!hojaOP) throw new Error('Hoja "Orden_Pedido" no encontrada');
    if (!hojaClientes) throw new Error('Hoja "Clientes" no encontrada');
    if (!hojaUsuarios) throw new Error('Hoja "Usuarios" no encontrada');

    var hojaDetalle = ss.getSheetByName('Detalle_Pedido');
    if (!hojaDetalle) throw new Error('Hoja "Detalle_Pedido" no encontrada');

    var datosOP = hojaOP.getDataRange().getValues();
    var datosClientes = hojaClientes.getDataRange().getValues();
    var datosUsuarios = hojaUsuarios.getDataRange().getValues();
    var datosDetalle = hojaDetalle.getDataRange().getValues();

    // Si solo hay encabezados, retornar vacío
    if (datosOP.length <= 1) return [];

    // Construir mapa de valor_total por id_op desde Detalle_Pedido
    // Columnas: 0=id_detalle, 1=id_op, 6=valor_total
    var totalesPorOrden = {};
    for (var d = 1; d < datosDetalle.length; d++) {
      var idOpDetalle = String(datosDetalle[d][1]);
      var valorItem = Number(datosDetalle[d][6]) || 0;
      totalesPorOrden[idOpDetalle] = (totalesPorOrden[idOpDetalle] || 0) + valorItem;
    }

    // Mapas para lookup rápido (convertir clave a string para evitar desajuste de tipos)
    var mapaClientes = {};
    for (var c = 1; c < datosClientes.length; c++) {
      mapaClientes[String(datosClientes[c][0])] = datosClientes[c][1]; // id -> nombre_local
    }

    var mapaUsuarios = {};
    for (var u = 1; u < datosUsuarios.length; u++) {
      mapaUsuarios[String(datosUsuarios[u][0])] = datosUsuarios[u][1]; // id -> nombre
    }

    var encabezados = datosOP[0];
    var ordenes = [];

    for (var i = 1; i < datosOP.length; i++) {
      var fila = datosOP[i];

      // Saltar filas vacías (sin id_op)
      if (!fila[0] && fila[0] !== 0) continue;

      var obj = {};
      for (var j = 0; j < encabezados.length; j++) {
        var valor = fila[j];

        // Convertir objetos Date a string legible para evitar errores en el cliente
        if (valor instanceof Date) {
          obj[encabezados[j]] = Utilities.formatDate(valor, 'America/Bogota', 'yyyy-MM-dd HH:mm:ss');
        } else {
          obj[encabezados[j]] = valor;
        }
      }

      // Agregar nombres legibles (usar String() para asegurar match de tipos)
      obj.nombre_cliente = mapaClientes[String(obj.id_cliente)] || 'Desconocido';
      obj.nombre_vendedor = mapaUsuarios[String(obj.id_vendedor)] || 'Desconocido';

      // Calcular valor_total desde Detalle_Pedido (fuente confiable)
      obj.valor_total = totalesPorOrden[String(obj.id_op)] || 0;

      // Aplicar filtros
      var incluir = true;
      if (filtros) {
        if (filtros.estado && filtros.estado !== 'Todos' && obj.estado !== filtros.estado) {
          incluir = false;
        }
        if (filtros.id_vendedor && String(obj.id_vendedor) !== String(filtros.id_vendedor)) {
          incluir = false;
        }
      }

      if (incluir) {
        ordenes.push(obj);
      }
    }

    // Ordenar por fecha descendente (las fechas ya son strings formato yyyy-MM-dd)
    ordenes.sort(function(a, b) {
      var fechaA = a.fecha || '';
      var fechaB = b.fecha || '';
      return fechaB.localeCompare(fechaA);
    });

    return ordenes;

  } catch (e) {
    Logger.log('Error en obtenerOrdenes: ' + e.message);
    throw new Error('Error al obtener órdenes: ' + e.message);
  }
}

function obtenerDetalleOrden(idOp) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var hoja = ss.getSheetByName('Detalle_Pedido');
    if (!hoja) throw new Error('Hoja "Detalle_Pedido" no encontrada');

    var datos = hoja.getDataRange().getValues();
    var encabezados = datos[0];
    var resultado = [];

    for (var i = 1; i < datos.length; i++) {
      if (String(datos[i][1]) == String(idOp)) { // columna id_op (comparación segura)
        var obj = {};
        for (var j = 0; j < encabezados.length; j++) {
          var valor = datos[i][j];
          // Convertir objetos Date a string
          if (valor instanceof Date) {
            obj[encabezados[j]] = Utilities.formatDate(valor, 'America/Bogota', 'yyyy-MM-dd HH:mm:ss');
          } else {
            obj[encabezados[j]] = valor;
          }
        }
        resultado.push(obj);
      }
    }
    return resultado;

  } catch (e) {
    Logger.log('Error en obtenerDetalleOrden: ' + e.message);
    throw new Error('Error al obtener detalle: ' + e.message);
  }
}

// ============================================================
// ACTUALIZAR ESTADO DE ORDEN
// ============================================================
function actualizarEstadoOrden(idOp, nuevoEstado, observaciones, nombreReceptor) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hojaOP = ss.getSheetByName('Orden_Pedido');
  var hojaDetalle = ss.getSheetByName('Detalle_Pedido');
  var datos = hojaOP.getDataRange().getValues();

  var ahora = new Date();
  var fechaHora = Utilities.formatDate(ahora, 'America/Bogota', 'yyyy-MM-dd HH:mm:ss');
  var hora = Utilities.formatDate(ahora, 'America/Bogota', 'HH:mm:ss');

  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0]) === String(idOp)) {
      var fila = i + 1; // Fila en la hoja (1-indexed)

      // Actualizar estado (columna 7)
      hojaOP.getRange(fila, 7).setValue(nuevoEstado);

      // Si cambia a Prestado: registrar fecha_prestamo, fecha_limite y nombre_receptor
      if (nuevoEstado === ESTADOS.PRESTADO) {
        hojaOP.getRange(fila, 10).setValue(fechaHora); // fecha_prestamo
        var fechaLimite = calcularFechaLimite(ahora, 1); // 1 día hábil
        var fechaLimiteStr = Utilities.formatDate(fechaLimite, 'America/Bogota', 'yyyy-MM-dd HH:mm:ss');
        hojaOP.getRange(fila, 11).setValue(fechaLimiteStr); // fecha_limite_devolucion

        // Guardar nombre de quien recibe el equipo (columna 14)
        if (nombreReceptor) {
          hojaOP.getRange(fila, 14).setValue(nombreReceptor);
        }

        // Actualizar hora_entrega en detalle
        var datosDetalle = hojaDetalle.getDataRange().getValues();
        for (var d = 1; d < datosDetalle.length; d++) {
          if (String(datosDetalle[d][1]) === String(idOp)) {
            hojaDetalle.getRange(d + 1, 9).setValue(hora); // hora_entrega
            hojaDetalle.getRange(d + 1, 8).setValue(ESTADOS.PRESTADO); // estado_item
          }
        }
      }

      // Si cambia a Regresado: registrar hora_regreso en detalle
      if (nuevoEstado === ESTADOS.REGRESADO) {
        var datosDetalle2 = hojaDetalle.getDataRange().getValues();
        for (var d2 = 1; d2 < datosDetalle2.length; d2++) {
          if (String(datosDetalle2[d2][1]) === String(idOp)) {
            hojaDetalle.getRange(d2 + 1, 10).setValue(hora); // hora_regreso
            hojaDetalle.getRange(d2 + 1, 8).setValue(ESTADOS.REGRESADO); // estado_item
          }
        }
      }

      // Agregar observaciones si las hay
      if (observaciones) {
        var obsActuales = datos[i][8] || '';
        var nuevaObs = obsActuales + (obsActuales ? ' | ' : '') +
                       '[' + fechaHora + '] ' + observaciones;
        hojaOP.getRange(fila, 9).setValue(nuevaObs);
      }

      return { success: true, estado: nuevoEstado };
    }
  }

  return { success: false, mensaje: 'Orden no encontrada' };
}

// ============================================================
// LÓGICA DE VENCIMIENTO DE PRÉSTAMO
// ============================================================
function esDiaHabil(fecha) {
  var dia = fecha.getDay(); // 0=dom, 6=sab
  if (dia === 0 || dia === 6) return false;

  var mesDia = ('0' + (fecha.getMonth() + 1)).slice(-2) + '-' +
               ('0' + fecha.getDate()).slice(-2);
  return FESTIVOS_CO.indexOf(mesDia) === -1;
}

function calcularFechaLimite(fechaInicio, diasHabiles) {
  var fecha = new Date(fechaInicio);
  var diasContados = 0;

  while (diasContados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    if (esDiaHabil(fecha)) {
      diasContados++;
    }
  }

  return fecha;
}

function verificarVencimientos() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Orden_Pedido');
  var datos = hoja.getDataRange().getValues();

  var ahora = new Date();
  var fechaHora = Utilities.formatDate(ahora, 'America/Bogota', 'yyyy-MM-dd HH:mm:ss');
  var cambios = 0;

  for (var i = 1; i < datos.length; i++) {
    var estado = datos[i][6];
    var fechaLimite = datos[i][10];

    if (estado === ESTADOS.PRESTADO && fechaLimite) {
      var fechaLimiteDate = new Date(fechaLimite);

      if (ahora > fechaLimiteDate) {
        var fila = i + 1;
        hoja.getRange(fila, 7).setValue(ESTADOS.POR_COBRAR); // estado
        hoja.getRange(fila, 13).setValue(fechaHora);          // alerta_vencimiento
        cambios++;
        Logger.log('Orden ' + datos[i][1] + ' cambió a Por Cobrar/Devolver');
      }
    }
  }

  Logger.log('Verificación completada. Órdenes actualizadas: ' + cambios);
  return cambios;
}

// Configurar trigger para verificar vencimientos cada hora
function configurarTriggerVencimientos() {
  // Eliminar triggers existentes de esta función
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'verificarVencimientos') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Crear nuevo trigger cada hora
  ScriptApp.newTrigger('verificarVencimientos')
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log('Trigger de vencimientos configurado (cada 1 hora)');
}

// ============================================================
// CRUD — USUARIOS (Solo Super admin)
// ============================================================
function obtenerUsuarios() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Usuarios');
  var datos = hoja.getDataRange().getValues();
  var encabezados = datos[0];
  var resultado = [];

  for (var i = 1; i < datos.length; i++) {
    var obj = {};
    for (var j = 0; j < encabezados.length; j++) {
      if (encabezados[j] !== 'password_hash') { // No enviar hash al cliente
        obj[encabezados[j]] = datos[i][j];
      }
    }
    resultado.push(obj);
  }
  return resultado;
}

function crearUsuario(datos) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Usuarios');
  var ultimaFila = hoja.getLastRow();
  var nuevoId = ultimaFila;

  var passwordHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    datos.password
  ).map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');

  var fila = [
    nuevoId,
    datos.nombre,
    datos.email,
    passwordHash,
    datos.rol,
    datos.local_asignado || '',
    'Sí',
    new Date().toISOString()
  ];

  hoja.appendRow(fila);
  return { success: true, id_usuario: nuevoId };
}

// ============================================================
// OBTENER CONTADORES PARA DASHBOARD
// ============================================================
function obtenerContadores() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var hoja = ss.getSheetByName('Orden_Pedido');
  var datos = hoja.getDataRange().getValues();

  var contadores = {
    Pendiente: 0,
    Prestado: 0,
    'Por Cobrar/Devolver': 0,
    Facturado: 0,
    Regresado: 0
  };

  for (var i = 1; i < datos.length; i++) {
    var estado = datos[i][6];
    if (contadores.hasOwnProperty(estado)) {
      contadores[estado]++;
    }
  }

  return contadores;
}

// ============================================================
// REPORTE EXCEL
// ============================================================
function generarReporteExcel(filtros) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ordenes = obtenerOrdenes(filtros);

  // Crear spreadsheet temporal
  var tempSS = SpreadsheetApp.create('Reporte_OP_VentasVirtuales_' +
    Utilities.formatDate(new Date(), 'America/Bogota', 'yyyyMMdd'));

  // --- Hoja 1: Órdenes ---
  var hoja1 = tempSS.getActiveSheet();
  hoja1.setName('Órdenes');

  // Leer configuración del negocio para el reporte
  var configNegocio = getConfiguracion();

  // Título dinámico desde configuración
  hoja1.getRange(1, 1).setValue(configNegocio.nombre_comercial + ' — Reporte de Órdenes de Pedido');
  hoja1.getRange(1, 1, 1, 12).merge();
  hoja1.getRange(1, 1).setFontWeight('bold').setFontSize(14);

  // Rango de fechas
  var infoFecha = 'Generado: ' + Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd HH:mm');
  if (filtros && filtros.fecha_inicio) infoFecha += ' | Desde: ' + filtros.fecha_inicio;
  if (filtros && filtros.fecha_fin) infoFecha += ' | Hasta: ' + filtros.fecha_fin;
  hoja1.getRange(2, 1).setValue(infoFecha);

  // Encabezados
  var encabezados = ['N° OP', 'Fecha creación', 'Cliente', 'Local origen', 'Vendedor',
    'Descripción productos', 'Valor total', 'Hora entrega', 'Fecha límite devolución',
    'Estado', 'Fecha cambio estado', 'Observaciones'];
  hoja1.getRange(4, 1, 1, encabezados.length).setValues([encabezados]);
  hoja1.getRange(4, 1, 1, encabezados.length).setBackground('#ffcf22').setFontWeight('bold');

  // Datos
  for (var i = 0; i < ordenes.length; i++) {
    var o = ordenes[i];
    var detalle = obtenerDetalleOrden(o.id_op);
    var descProductos = detalle.map(function(d) { return d.descripcion_libre; }).join(', ');
    var valorTotal = detalle.reduce(function(sum, d) { return sum + (d.valor_total || 0); }, 0);

    var filaData = [
      o.numero_op, o.fecha, o.nombre_cliente, o.local_origen, o.nombre_vendedor,
      descProductos, valorTotal, o.hora_creacion, o.fecha_limite_devolucion || '',
      o.estado, o.alerta_vencimiento || '', o.observaciones || ''
    ];

    var filaNum = 5 + i;
    hoja1.getRange(filaNum, 1, 1, filaData.length).setValues([filaData]);

    // Colorear filas según estado
    if (o.estado === ESTADOS.POR_COBRAR) {
      hoja1.getRange(filaNum, 1, 1, filaData.length).setBackground('#ffcccc');
    } else if (o.estado === ESTADOS.REGRESADO) {
      hoja1.getRange(filaNum, 1, 1, filaData.length).setBackground('#f5f5f5');
    }
  }

  // --- Hoja 2: Resumen ---
  var hoja2 = tempSS.insertSheet('Resumen');

  // Resumen por estado
  hoja2.getRange(1, 1).setValue('Resumen por Estado').setFontWeight('bold');
  hoja2.getRange(2, 1, 1, 3).setValues([['Estado', 'Cantidad órdenes', 'Valor total']]);
  hoja2.getRange(2, 1, 1, 3).setBackground('#ffcf22').setFontWeight('bold');

  var contadores = obtenerContadores();
  var filaResumen = 3;
  var estados = Object.keys(contadores);
  for (var e = 0; e < estados.length; e++) {
    hoja2.getRange(filaResumen + e, 1, 1, 3).setValues([
      [estados[e], contadores[estados[e]], 0] // TODO: calcular valor total por estado
    ]);
  }

  // Pie del reporte con datos de contacto
  var filaPie = filaResumen + estados.length + 2;
  hoja2.getRange(filaPie, 1).setValue('Contacto: ' + configNegocio.celular + ' | ' + configNegocio.correo);
  hoja2.getRange(filaPie, 1).setFontSize(9).setFontColor('#888888');

  // Obtener URL de descarga
  var tempFile = DriveApp.getFileById(tempSS.getId());
  var url = 'https://docs.google.com/spreadsheets/d/' + tempSS.getId() + '/export?format=xlsx';

  // Programar eliminación en 5 minutos
  ScriptApp.newTrigger('eliminarArchivoTemporal')
    .timeBased()
    .after(5 * 60 * 1000)
    .create();

  // Guardar ID para eliminación
  PropertiesService.getScriptProperties().setProperty('temp_file_id', tempSS.getId());

  return { success: true, url: url };
}

function eliminarArchivoTemporal() {
  var fileId = PropertiesService.getScriptProperties().getProperty('temp_file_id');
  if (fileId) {
    try {
      DriveApp.getFileById(fileId).setTrashed(true);
      Logger.log('Archivo temporal eliminado: ' + fileId);
    } catch(e) {
      Logger.log('Error eliminando archivo temporal: ' + e.message);
    }
    PropertiesService.getScriptProperties().deleteProperty('temp_file_id');
  }
}
