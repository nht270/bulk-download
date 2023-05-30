import './assets/sass/index.scss'
import AppContent from './components/AppContent'
import ThemeWrapper from './components/ThemeWrapper'
import TitleBar from './components/TitleBar'
import MainProvider from './store/MainProvider'

function App() {
  return (
    <MainProvider>
      <ThemeWrapper>
        <div className='app-wrap'>
          <TitleBar />
          <AppContent />
        </div>
      </ThemeWrapper>
    </MainProvider>
  )
}

export default App
