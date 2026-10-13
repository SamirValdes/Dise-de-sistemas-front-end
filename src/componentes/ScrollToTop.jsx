import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/*
 * Sin esto, al cambiar de página se conserva la posición de scroll anterior y se
 * aterriza a mitad de la cartelera.
 *
 * Si la ruta trae ancla (por ejemplo "/#cartelera") se respeta el ancla en lugar de
 * subir arriba; por eso el efecto depende también de `hash`.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const destino = document.querySelector(hash);
      if (destino) {
        destino.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;
