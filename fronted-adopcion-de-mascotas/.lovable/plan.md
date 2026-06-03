
## Plan de Implementación — Funcionalidades Faltantes AdoptaMe

Dado el volumen de features, propongo implementarlas en **3 fases** priorizando por dependencias y valor:

---

### Fase 1 — Autenticación y Perfiles Completos
1. **Olvidaste tu contraseña** — Modal con campo de email y mensaje de confirmación simulado
2. **Cambiar contraseña** — Opción en el dropdown del usuario en la Navbar
3. **Perfil Adoptante mejorado** — Campos: tipo vivienda, patio, horas sola, experiencia, composición familiar
4. **Perfil Fundación mejorado** — NIT, dirección, teléfono, redes sociales, misión
5. **Panel Admin para verificar fundaciones** — Aprobar/Rechazar fundaciones

### Fase 2 — Gestión de Mascotas y Solicitudes Avanzadas
6. **Publicar Mascota** — Formulario completo (nombre, especie, raza, edad, tamaño, sexo, esterilización, vacunas, temperamento, fotos, ubicación, condiciones)
7. **Editar publicación de mascota**
8. **Flujo de solicitudes mejorado** — Estados: Recibida → En Evaluación → Aprobada/Rechazada con motivo, historial de auditoría, cambio automático de estado de mascota
9. **Observaciones/notas de la fundación** — Área de texto, tareas pendientes, visibilidad privada/compartida
10. **Agenda de citas** — Calendario con día/hora, modalidad presencial, notificaciones y actividades pendientes

### Fase 3 — Documentación y Cierre de Adopción
11. **Carga de documentos** — Cédula, recibo servicios, fotos del hogar (JPG/PNG/PDF, max 5MB), estado "Documentación Cargada"
12. **Compromiso/Contrato digital** — Texto legal, checkboxes por cláusula, captura de IP/fecha, generación de PDF
13. **Revisión de documentos por fundación** — Visualizar, aprobar/rechazar con comentario, checklist de verificación
14. **Botón "Finalizar Adopción"** — Solo habilitado con todo aprobado, cambia estado a "Adoptado"

---

### Notas técnicas
- Todo con mock data (sin backend real por ahora)
- Se ampliarán los tipos en `mockData.ts` y el `AppContext`
- Nuevas páginas/componentes según sea necesario
- UI consistente con el diseño actual (verde menta, Nunito/Inter)

**¿Apruebas este plan? ¿Quieres que empiece por alguna fase en particular?**
