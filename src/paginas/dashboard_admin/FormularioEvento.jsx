import { useState } from 'react';

const CAMPOS_BASE_INICIALES = {
  nombre: '',
  descripcion: '',
  informacionAdicional: '',
  fecha: '',
  hora: '',
  imagenUrl: '',
  categoria: '',
  precioBase: '',
  fechaInicioVenta: '',
  fechaFinVenta: '',
  duracion: '',
  sala: '',
};

// Valores por defecto del layout de asientos: los mismos que usa el seed (ver precios.js /
// MapaAsientos.jsx). Solo aplican al crear: el backend no permite editar filas/columnas
// después, para no desincronizarlas de los asientos ya generados.
const CAMPOS_ASIENTOS_INICIALES = {
  filasVip: 3,
  columnasVip: 8,
  filasGenerales: 7,
  columnasGenerales: 12,
};

function valoresDesdeEvento(evento) {
  return {
    nombre: evento.nombre,
    descripcion: evento.descripcion,
    informacionAdicional: evento.informacionAdicional ?? '',
    fecha: evento.fecha,
    hora: evento.hora.slice(0, 5),
    imagenUrl: evento.imagenUrl ?? '',
    categoria: evento.categoria,
    precioBase: evento.precioBase,
    fechaInicioVenta: evento.fechaInicioVenta,
    fechaFinVenta: evento.fechaFinVenta,
    duracion: evento.duracion ?? '',
    sala: evento.sala ?? '',
  };
}

/**
 * Formulario de crear/editar evento. Los campos de layout de asientos (filas/columnas)
 * solo aparecen al crear, porque el backend no los deja editar después.
 */
function FormularioEvento({ eventoEnEdicion, alGuardar, alCancelar }) {
  const esEdicion = Boolean(eventoEnEdicion);

  const [valores, setValores] = useState(() =>
    esEdicion
      ? valoresDesdeEvento(eventoEnEdicion)
      : { ...CAMPOS_BASE_INICIALES, ...CAMPOS_ASIENTOS_INICIALES },
  );
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cambiar = (campo) => (evento) => {
    setValores((previos) => ({ ...previos, [campo]: evento.target.value }));
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setError('');
    setGuardando(true);

    const datos = {
      ...valores,
      precioBase: Number(valores.precioBase),
      ...(esEdicion
        ? {}
        : {
            filasVip: Number(valores.filasVip),
            columnasVip: Number(valores.columnasVip),
            filasGenerales: Number(valores.filasGenerales),
            columnasGenerales: Number(valores.columnasGenerales),
          }),
    };

    try {
      await alGuardar(datos);
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={enviar}>
      <h4 className="admin-form-titulo">{esEdicion ? 'Editar evento' : 'Nuevo evento'}</h4>

      <div className="admin-form-grid">
        <label className="admin-form-campo">
          Nombre
          <input type="text" value={valores.nombre} onChange={cambiar('nombre')} required />
        </label>

        <label className="admin-form-campo">
          Categoría
          <input type="text" value={valores.categoria} onChange={cambiar('categoria')} required />
        </label>

        <label className="admin-form-campo admin-form-campo-ancho">
          Descripción
          <input type="text" value={valores.descripcion} onChange={cambiar('descripcion')} required />
        </label>

        <label className="admin-form-campo admin-form-campo-ancho">
          Información adicional
          <textarea value={valores.informacionAdicional} onChange={cambiar('informacionAdicional')} rows={3} />
        </label>

        <label className="admin-form-campo">
          Fecha
          <input type="date" value={valores.fecha} onChange={cambiar('fecha')} required />
        </label>

        <label className="admin-form-campo">
          Hora
          <input type="time" value={valores.hora} onChange={cambiar('hora')} required />
        </label>

        <label className="admin-form-campo">
          Precio base
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={valores.precioBase}
            onChange={cambiar('precioBase')}
            required
          />
        </label>

        <label className="admin-form-campo">
          Duración
          <input type="text" placeholder="2h 30min" value={valores.duracion} onChange={cambiar('duracion')} />
        </label>

        <label className="admin-form-campo">
          Sala
          <input type="text" value={valores.sala} onChange={cambiar('sala')} />
        </label>

        <label className="admin-form-campo">
          Imagen (URL)
          <input type="text" value={valores.imagenUrl} onChange={cambiar('imagenUrl')} />
        </label>

        <label className="admin-form-campo">
          Inicio de venta
          <input type="date" value={valores.fechaInicioVenta} onChange={cambiar('fechaInicioVenta')} required />
        </label>

        <label className="admin-form-campo">
          Fin de venta
          <input type="date" value={valores.fechaFinVenta} onChange={cambiar('fechaFinVenta')} required />
        </label>

        {!esEdicion && (
          <>
            <label className="admin-form-campo">
              Filas VIP
              <input type="number" min="1" value={valores.filasVip} onChange={cambiar('filasVip')} required />
            </label>
            <label className="admin-form-campo">
              Columnas VIP
              <input type="number" min="1" value={valores.columnasVip} onChange={cambiar('columnasVip')} required />
            </label>
            <label className="admin-form-campo">
              Filas generales
              <input
                type="number"
                min="1"
                value={valores.filasGenerales}
                onChange={cambiar('filasGenerales')}
                required
              />
            </label>
            <label className="admin-form-campo">
              Columnas generales
              <input
                type="number"
                min="1"
                value={valores.columnasGenerales}
                onChange={cambiar('columnasGenerales')}
                required
              />
            </label>
          </>
        )}
      </div>

      {error && <p className="admin-form-error">{error}</p>}

      <div className="admin-form-acciones">
        <button type="button" className="btn-admin-secundario" onClick={alCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-admin" disabled={guardando}>
          {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear evento'}
        </button>
      </div>
    </form>
  );
}

export default FormularioEvento;
