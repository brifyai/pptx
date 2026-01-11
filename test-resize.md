# Test de Paneles Redimensionables

## Pasos para Probar

1. **Abrir la aplicación:**
   - Ir a http://localhost:3006
   - Subir un template PPTX

2. **Probar panel izquierdo (miniaturas):**
   - Colocar el cursor sobre la línea divisoria derecha del panel de miniaturas
   - El cursor debe cambiar a `col-resize`
   - Arrastrar hacia la izquierda/derecha
   - Verificar que el panel se redimensiona
   - Verificar límites: mínimo 200px, máximo 500px

3. **Probar panel derecho (chat):**
   - Colocar el cursor sobre la línea divisoria izquierda del panel de chat
   - El cursor debe cambiar a `col-resize`
   - Arrastrar hacia la izquierda/derecha
   - Verificar que el panel se redimensiona
   - Verificar límites: mínimo 300px, máximo 700px

4. **Probar panel central (visor):**
   - El panel central debe ajustarse automáticamente
   - Debe mantener la proporción 16:9 de la lámina
   - La lámina debe verse centrada y sin bordes blancos

5. **Probar persistencia:**
   - Redimensionar los paneles
   - Recargar la página (F5)
   - Verificar que los tamaños se mantienen

6. **Probar visual feedback:**
   - Hacer hover sobre los divisores
   - La línea debe cambiar de color (gris → azul)
   - La línea debe crecer ligeramente

## Checklist de Funcionalidades

- [ ] Panel izquierdo redimensionable
- [ ] Panel derecho redimensionable
- [ ] Panel central se ajusta automáticamente
- [ ] Límites de tamaño funcionan
- [ ] Cursor cambia durante resize
- [ ] Visual feedback en hover
- [ ] Persistencia en localStorage
- [ ] Lámina se ve correctamente en el centro
- [ ] Miniaturas se ven correctamente a la izquierda
- [ ] Chat funciona correctamente a la derecha

## Problemas Conocidos

Ninguno por el momento.

## Notas

- Los tamaños se guardan en localStorage con las claves:
  - `slide-thumbnails-width` (panel izquierdo)
  - `chat-panel-width` (panel derecho)
- Para resetear los tamaños, ejecutar en consola:
  ```javascript
  localStorage.removeItem('slide-thumbnails-width')
  localStorage.removeItem('chat-panel-width')
  location.reload()
  ```
