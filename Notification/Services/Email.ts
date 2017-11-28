const defaultTemplates = {

}

class EmailNotificationService{
  constructor(){

  }

  prepareTemplate = (template, templateParams) => ({
    from: this.templateHelper(template, templateParams, 'from'),
    to: this.templateHelper(template, templateParams, 'to'),
    subject: this.templateHelper(template, templateParams, 'subject'),
    text: this.templateHelper(template, templateParams, 'text')
  })

  send = () => {

  }

  templateHelper = (template, templateParams, field) => 
    template[field]
    ? isFunction(template[field])
      ? template[field]( templateParams || this.config[field] )
      : template[field]
    : this.config[field]
}