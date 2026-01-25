# Plan: Syntheia - SaaS de Usuarios Sintéticos para Encuestas

## Decisiones Finales
- **Nombre**: Syntheia
- **Tagline**: "Real insights. Synthetic speed."
- **Mercado inicial**: USA/Global (inglés primero)
- **Vertical inicial**: CPG/Consumer Goods
- **Dominio objetivo**: syntheia.ai o syntheia.io

---

## Resumen Ejecutivo

**Syntheia** es un SaaS B2B que utiliza LLMs para generar **panelistas sintéticos** que respondan encuestas de investigación de mercado, reduciendo costos y tiempos de reclutamiento en 90%+ mientras mantiene validez estadística comparable a paneles humanos.

---

## 1. Fundamento Científico (Artículo arXiv 2510.08338)

### Metodología SSR (Semantic Similarity Rating)
- **Problema resuelto**: Los LLMs producen distribuciones de respuestas irreales cuando se les pide ratings numéricos directamente
- **Solución**: Obtener respuestas textuales del LLM y mapearlas a distribuciones Likert usando similaridad de embeddings con declaraciones de referencia
- **Validación**: Testeado contra 9,300 respuestas humanas de 57 encuestas de productos de cuidado personal
- **Resultados**:
  - 90% de la confiabilidad test-retest humana
  - Distribuciones realistas (KS similarity > 0.85)
  - Explicaciones cualitativas junto con ratings cuantitativos

### Ventaja Competitiva Técnica
Esta metodología permite:
1. Escalar simulaciones de investigación de consumidor
2. Preservar métricas tradicionales de encuestas
3. Obtener insights cualitativos ricos que explican el "por qué" detrás de las respuestas

---

## 2. Propuesta de Valor

### Problema del Mercado
| Dolor | Impacto |
|-------|---------|
| Reclutamiento de panelistas cuesta $5-50 por respondente | Presupuestos limitados = muestras pequeñas |
| Tiempos de 2-6 semanas para completar estudios | Decisiones lentas, mercado cambia |
| Panel fatigue: respondentes desinteresados | Datos de baja calidad |
| Sesgos geográficos y demográficos en paneles | Insights no representativos |
| Dificultad para targets nicho (médicos, CEOs, etc.) | Estudios imposibles o carísimos |

### Solución
**Panelistas sintéticos on-demand** que:
- Responden en minutos, no semanas
- Cuestan centavos por respondente, no dólares
- Pueden simular cualquier perfil demográfico/psicográfico
- Proporcionan explicaciones cualitativas automáticas
- Tienen consistencia estadística validada científicamente

---

## 3. Naming & Branding

### Opciones de Nombre (Evaluadas - Expandida)

**CATEGORÍA 1: Evocadores/Mitológicos**
| Nombre | Significado | Tagline Potencial |
|--------|-------------|-------------------|
| **Syntheia** | "Synthetic" + Theia (diosa griega de la visión) | "Real insights. Synthetic speed." |
| **Arquetype** | Patrones universales de Jung | "Know your audience before you ask" |
| **Prometheus** | El titán que dio fuego (conocimiento) a la humanidad | "Unlock human understanding" |
| **Chimera** | Criatura híbrida mitológica | "Where data meets imagination" |
| **Oracle** | Profetisa de Delfos | "See your market clearly" |

**CATEGORÍA 2: Científicos/Técnicos**
| Nombre | Significado | Tagline Potencial |
|--------|-------------|-------------------|
| **Respondex** | Respond + Index | "The synthetic respondent engine" |
| **SynthPanel** | Panel sintético | "Research at the speed of thought" |
| **Quorum** | Número mínimo para decidir | "Instant consensus" |
| **Hypothesis** | Método científico | "Test before you invest" |
| **Axiom** | Verdad evidente | "Self-evident insights" |

**CATEGORÍA 3: Accionables/Dinámicos**
| Nombre | Significado | Tagline Potencial |
|--------|-------------|-------------------|
| **AskForge** | Forjar preguntas/respuestas | "Forge better decisions" |
| **PulseAI** | El pulso del mercado | "Feel your market's heartbeat" |
| **VoxSynth** | Voz sintética (latín) | "A thousand voices, one platform" |
| **Mindmeld** | Fusión de mentes | "Synthetic minds, real insights" |
| **Crowdcast** | Multitud + pronóstico | "Predict what people think" |

**CATEGORÍA 4: Simples/Memorables**
| Nombre | Significado | Tagline Potencial |
|--------|-------------|-------------------|
| **Synth** | Abreviación directa | "Research, synthesized" |
| **Mira** | "Mira" (español) + "mira" (asombroso en latín) | "See what your customers see" |
| **Vero** | Verdad en latín | "True insights, fast" |
| **Nex** | Siguiente/conexión | "The next generation of research" |
| **Vox** | Voz en latín | "Give voice to your audience" |

### Top 5 Recomendaciones (ordenadas)

1. **Syntheia** - Balance perfecto: sofisticado pero accesible, memorable, dominio disponible
2. **VoxSynth** - Poderoso, "mil voces", conecta con el concepto de panel
3. **Quorum** - Elegante, B2B, implica consenso y decisiones
4. **Arquetype** - Profundo, psicológico, diferenciado (ya tienes el proyecto así)
5. **Mira** - Simple, bilingüe, doble significado positivo

---

## Mercado Objetivo: USA/Global Primero (Recomendado)

**Por qué:**
1. **Credibilidad científica**: El paper está en inglés, publicado en arXiv - academia angloparlante
2. **Mercado maduro**: Market research es industria de $80B+ en USA, empresas acostumbradas a pagar
3. **Mejores márgenes**: Pricing en USD sin localización = márgenes 2-3x vs LATAM
4. **Talento y partnerships**: Más fácil encontrar advisors, investors, early adopters sofisticados
5. **Expansion path**: USA → LATAM es más fácil que LATAM → USA

**Estrategia de expansión posterior:**
- Mes 6+: Agregar español como segundo idioma
- Mes 9+: Pricing localizado para LATAM (PPP adjustments)
- Mes 12+: Team de ventas LATAM si hay tracción

---

## Vertical Inicial: CPG/Consumer Goods (Recomendado)

**Por qué CPG (Consumer Packaged Goods = productos de consumo masivo):**
1. **Validación científica**: El paper usó exactamente este vertical (cuidado personal)
2. **Volumen alto**: CPG hace miles de estudios/año (packaging, sabores, precios)
3. **Presupuesto**: Unilever, P&G, Nestlé tienen budgets de research de $100M+/año
4. **Ciclos rápidos**: Necesitan respuestas rápidas para lanzamientos trimestrales
5. **Case studies claros**: Fácil demostrar "antes vs después"

**Expansion roadmap:**
- Launch: CPG/Consumer Goods
- Mes 4+: Tech/SaaS (feature prioritization, product-market fit)
- Mes 8+: Healthcare (patient personas, drug naming)
- Mes 12+: Financial Services (customer segmentation)

---

**Syntheia**:
- Posicionamiento: "La investigadora de mercado que nunca duerme"
- Tagline: "Real insights. Synthetic speed."
- Dominio: syntheia.ai / syntheia.io

### Identidad Visual Sugerida
- **Colores**: Azul profundo (#1a365d) + Verde menta (#48bb78) + Blanco
- **Tipografía**: Inter (UI) + Fraunces (headlines) - moderna pero confiable
- **Estilo**: Data-driven pero humano, no frío/robótico
- **Iconografía**: Formas orgánicas que representan personas/perfiles

---

## 4. Arquitectura del Producto

### MVP - Funcionalidades Core

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DEL USUARIO                         │
├─────────────────────────────────────────────────────────────┤
│  1. CREAR ESTUDIO                                            │
│     └─> Subir encuesta (CSV, Typeform, Google Forms)        │
│     └─> O usar editor de encuestas integrado                │
│                                                              │
│  2. DEFINIR PANEL SINTÉTICO                                  │
│     └─> Demografía: edad, género, ubicación, ingresos       │
│     └─> Psicografía: valores, estilo de vida, intereses     │
│     └─> Contexto: industria, rol, experiencia con producto  │
│     └─> Tamaño de muestra (100, 500, 1000, custom)          │
│                                                              │
│  3. EJECUTAR SIMULACIÓN                                      │
│     └─> SSR Engine procesa cada respondente                 │
│     └─> Genera respuestas + explicaciones cualitativas      │
│     └─> Tiempo: ~2-5 minutos para 500 respondentes          │
│                                                              │
│  4. ANALIZAR RESULTADOS                                      │
│     └─> Dashboard con métricas key                          │
│     └─> Distribuciones por segmento                         │
│     └─> Insights cualitativos agregados                     │
│     └─> Exportar a Excel/SPSS/PowerPoint                    │
└─────────────────────────────────────────────────────────────┘
```

### Motor SSR (Semantic Similarity Rating)

```python
# Pseudocódigo del core engine
class SSREngine:
    def generate_response(self, question, persona, scale_anchors):
        # 1. Construir prompt con persona rica
        prompt = self._build_persona_prompt(persona)

        # 2. Pedir respuesta textual, NO numérica
        text_response = llm.generate(
            f"{prompt}\n\nQ: {question}\nResponde en primera persona explicando tu opinión:"
        )

        # 3. Mapear a escala Likert via embeddings
        text_embedding = embed(text_response)
        anchor_embeddings = [embed(a) for a in scale_anchors]

        # 4. Calcular similaridad coseno con cada ancla
        similarities = [cosine_sim(text_embedding, ae) for ae in anchor_embeddings]

        # 5. Convertir a distribución probabilística
        likert_distribution = softmax(similarities)

        return {
            "rating": weighted_choice(likert_distribution),
            "explanation": text_response,
            "confidence": max(likert_distribution)
        }
```

### Tipos de Preguntas Soportadas (MVP)
1. **Likert scales** (5-7 puntos) - Actitudes y satisfacción
2. **NPS** (0-10) - Net Promoter Score
3. **Selección múltiple** - Preferencias
4. **Ranking** - Priorización
5. **Open-ended** - Insights cualitativos

---

## 5. Modelo de Negocio

### Pricing Strategy (Psicología aplicada)

**Modelo: Credits + Subscriptions (Híbrido)**

| Plan | Precio/mes | Créditos | Costo/respondente | Target |
|------|-----------|----------|-------------------|--------|
| **Starter** | $99 | 1,000 | $0.10 | Freelancers, pequeñas agencias |
| **Growth** | $499 | 7,500 | $0.07 | Agencias medianas, startups |
| **Scale** | $1,499 | 30,000 | $0.05 | Grandes consultoras, marcas |
| **Enterprise** | Custom | Ilimitado | $0.03-0.05 | Fortune 500, research firms |

**Psicología de pricing aplicada**:
- Good-Better-Best con el tier medio (Growth) como target
- Precio por respondente decrece = incentiva volumen
- Charm pricing evitado para posicionamiento premium
- Créditos que no expiran = reduce fricción de compra

### Unit Economics Target
- **COGS por respondente**: ~$0.01-0.02 (tokens LLM)
- **Gross margin**: 80-95%
- **CAC target**: <$500 (B2B)
- **LTV target**: >$5,000 (12+ meses retention)

---

## 6. Go-to-Market Strategy

### Fase 1: Validación (Meses 1-3)

**Target inicial**: Agencias de investigación de mercado pequeñas-medianas

**Tácticas** (de la skill marketing-ideas):

1. **Engineering as Marketing (#30)**:
   - Crear "Free Survey Simulator" - versión limitada gratuita
   - 50 respondentes sintéticos gratis/mes
   - Captura emails y educa sobre el concepto

2. **Proprietary Data Content (#56)**:
   - Publicar comparativa: "Sintético vs Humano: 10 Estudios Comparados"
   - Generar backlinks y credibilidad científica

3. **LinkedIn Audience (#105)**:
   - Founder content sobre futuro de market research
   - Targeting: Market Research Directors, Consumer Insights Managers

4. **Podcast Tours (#45)**:
   - Guest en podcasts de investigación de mercado
   - "The Market Research Podcast", "Insights Unlocked"

### Fase 2: Crecimiento (Meses 4-8)

1. **Integration Marketing (#98)**:
   - Integraciones con Qualtrics, SurveyMonkey, Typeform
   - Co-marketing con partners

2. **Affiliate Program (#97)**:
   - 20% recurrente para consultores de research
   - Tools como Respondent.io pero para sintéticos

3. **Conference Speaking (#103)**:
   - ESOMAR, Quirks Event, IIeX
   - "The Science Behind Synthetic Respondents"

### Fase 3: Escala (Meses 9-12)

1. **Expert Networks (#37)**:
   - Certificación "Synthetic Research Specialist"
   - Consultores que implementan y venden

2. **Enterprise Sales**:
   - SDR team para top 100 research firms
   - Pilots con descuento para case studies

---

## 7. Diferenciación Competitiva

### Competidores Directos
| Competidor | Approach | Debilidad |
|------------|----------|-----------|
| Synthetic Users | Entrevistas con IA | No usa SSR, menos válido estadísticamente |
| AI Survey Tools genéricos | GPT wrapper básico | Distribuciones irreales, sin metodología |
| Paneles tradicionales (Dynata, etc.) | Humanos reales | Lentos, caros, panel fatigue |

### Moat (Foso Competitivo)
1. **Metodología SSR validada científicamente** - difícil de replicar correctamente
2. **Base de datos de perfiles sintéticos** calibrados - mejora con uso
3. **Integraciones enterprise** - switching costs altos
4. **Brand como "el estándar científico"** - first mover advantage

---

## 8. Consideraciones Éticas y Legales

### Transparencia Obligatoria
- Los clientes DEBEN declarar que usan datos sintéticos
- Watermark en reportes: "Generated with synthetic respondents"
- No para: decisiones médicas, legales, financieras críticas

### Casos de Uso Apropiados
- Exploración inicial de conceptos
- Testing de mensajes y posicionamiento
- Priorización de features
- Benchmarking de categoría
- Augmentar estudios humanos pequeños

### Casos de Uso NO Apropiados
- Reemplazar completamente estudios humanos críticos
- Tomar decisiones de salud pública
- Manipular resultados para agenda específica
- Presentar como "datos reales" a terceros

### Compliance
- GDPR: No aplica (no datos personales reales)
- Crear "Synthetic Research Ethics Guidelines" propias
- Advisory board con académicos de market research

---

## 9. Roadmap Técnico

### Sprint 1-2: Foundation
- [x] Setup proyecto (Next.js 15 + TypeScript)
- [x] Implementar SSR engine básico con Claude API
- [x] Editor de encuestas simple
- [x] Auth con Better Auth

### Sprint 3-4: Core Product
- [x] Definición de personas sintéticas
- [x] Dashboard de resultados básico
- [x] Exportación CSV/Excel

### Sprint 5-6: Polish & Launch
- [x] Landing page con framing científico
- [x] Onboarding guiado
- [x] Plan gratuito limitado (1000 credits by default)
- [x] Stripe billing

### Sprint 7-8: Growth Features
- [ ] Integraciones (Zapier, API)
- [ ] Templates de encuestas
- [ ] Análisis de sentimiento avanzado

---

## 10. Métricas de Éxito

### North Star Metric
**Estudios completados por mes** (no usuarios, no revenue directamente)

### KPIs por Fase

| Fase | Métrica | Target |
|------|---------|--------|
| Validación | Estudios completados | 100 |
| Validación | NPS de usuarios beta | >40 |
| Crecimiento | MRR | $10K |
| Crecimiento | Retention mensual | >80% |
| Escala | Enterprise deals | 5 |
| Escala | ARR | $500K |

---

## 11. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| LLMs no replican bien ciertos grupos | Alta | Alto | Validación continua, disclaimers claros |
| Resistencia de industria research | Media | Alto | Posicionar como complemento, no reemplazo |
| Competidor con más recursos | Media | Medio | Moverse rápido, nicho específico primero |
| Costos de API escalan | Baja | Medio | Modelos open-source como fallback |
| Regulación de IA sintética | Baja | Alto | Compliance proactivo, transparencia |

---

## 12. Próximos Pasos Inmediatos

### Esta Semana
1. [x] Decidir nombre final: **Syntheia**
2. [ ] Registrar dominio syntheia.ai / syntheia.io
3. [ ] Crear repositorio con estructura base
4. [ ] Implementar PoC del SSR engine

### Este Mes
1. [ ] Landing page con waitlist
2. [ ] MVP funcional con 5 beta users
3. [ ] Primer estudio de validación: comparar sintético vs real
4. [ ] Contenido fundacional: blog post sobre la metodología

---

## Verificación

Para validar que el plan funciona:

1. **Validación técnica**: Implementar SSR engine y comparar resultados con el paper
2. **Validación de mercado**: 10 entrevistas con researchers de agencias
3. **Validación de pricing**: Landing page con pricing, medir clicks en cada tier
4. **Validación de concepto**: Beta cerrada con 5 agencias, medir si repiten uso

---

*Plan generado combinando el fundamento científico del artículo arXiv 2510.08338 con estrategias de marketing probadas y principios de psicología del consumidor.*

*Fecha de creación: 2026-01-24*
