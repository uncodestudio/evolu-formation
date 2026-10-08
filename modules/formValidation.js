// Validation d'un formulaire Webflow avant l'envoi.
// Accroches : data-validate sur le <form> ; les champs à contrôler portent required (réglage Webflow) ;
// dans le même parent qu'un champ, un élément [data-form-error] contient son message d'erreur.
// Les bulles natives du navigateur sont coupées : ce sont les messages du Designer qui s'affichent.

const getError = (field) =>
  [...field.parentElement.children].find((el) => el !== field && el.hasAttribute('data-form-error'))

const isInvalid = (field) => field.value.trim() === '' || !field.checkValidity()

const setFieldState = (field, invalid) => {
  field.classList.toggle('is-error', invalid)
  field.setAttribute('aria-invalid', String(invalid))
  const error = getError(field)
  if (error) error.style.display = invalid ? 'block' : 'none'
}

export function init() {
  document.querySelectorAll('form[data-validate]').forEach((form) => {
    const fields = [...form.querySelectorAll('[required]')]
    if (!fields.length) return

    form.noValidate = true
    fields.forEach((field) => {
      const error = getError(field)
      if (error) {
        error.style.display = 'none'
        if (!error.id) error.id = `${field.name || field.id || 'champ'}-erreur`
        field.setAttribute('aria-describedby', error.id)
      }
      // Validation en direct dès qu'on remplit le champ, et quand on le quitte
      const validate = () => setFieldState(field, isInvalid(field))
      field.addEventListener('input', validate)
      field.addEventListener('blur', validate)
    })

    // Phase de capture : passe avant le gestionnaire d'envoi de Webflow pour pouvoir le bloquer
    form.addEventListener(
      'submit',
      (e) => {
        const invalidFields = fields.filter(isInvalid)
        fields.forEach((field) => setFieldState(field, invalidFields.includes(field)))
        if (!invalidFields.length) return
        e.preventDefault()
        e.stopImmediatePropagation()
        invalidFields[0].focus()
      },
      true
    )
  })
}
