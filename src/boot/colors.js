import { setCssVar } from 'quasar'

export default () => {
  setCssVar('budget', '#3B82F6', document.body)
  setCssVar('revision', '#F59E0B', document.body)
  setCssVar('analysis', '#8B5CF6', document.body)
  setCssVar('approved', '#10B981', document.body)
  setCssVar('rejected', '#EF4444', document.body)
  setCssVar('reanalysis', '#aa3e00', document.body)
  setCssVar('waiting', '#6B7280', document.body)
  setCssVar('realized', '#3e6fd1', document.body)
  setCssVar('delivered', '#12a755', document.body)
  setCssVar('finished', '#059669', document.body)
}
