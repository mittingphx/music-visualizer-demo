// import './style.css'
import { AudioController } from './audioController.js'
import { Visualizer } from './visualizer.js'

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('visualizer-canvas')
  const playPauseBtn = document.getElementById('play-pause-btn')
  const fileUpload = document.getElementById('audio-upload')
  const urlInput = document.getElementById('audio-url')
  const loadUrlBtn = document.getElementById('load-url-btn')
  const modeSelect = document.getElementById('visualizer-mode')

  // Initialize modules
  const audioController = new AudioController()
  const visualizer = new Visualizer(canvas, audioController)

  // Resize canvas
  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()

  // Event Listeners
  modeSelect.addEventListener('change', (e) => {
    visualizer.setMode(e.target.value)
  })

  fileUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0]
    if (file) {
      await audioController.loadFile(file)
      playPauseBtn.disabled = false
      playPauseBtn.textContent = 'Play'
      visualizer.start()
    }
  })

  loadUrlBtn.addEventListener('click', async () => {
    const url = urlInput.value
    if (url) {
      try {
        await audioController.loadUrl(url)
        playPauseBtn.disabled = false
        playPauseBtn.textContent = 'Play'
        visualizer.start()
      } catch (error) {
        console.error("Failed to load URL", error)
        alert("Could not load audio from URL. Check CORS or URL validity.")
      }
    }
  })

  playPauseBtn.addEventListener('click', () => {
    if (audioController.isPlaying) {
      audioController.pause()
      playPauseBtn.textContent = 'Play'
    } else {
      audioController.play()
      playPauseBtn.textContent = 'Pause'
    }
  })
})
