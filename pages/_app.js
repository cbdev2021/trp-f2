import { Provider } from 'react-redux'
import { store } from '../store'
import { useEffect } from 'react'
import '../styles/globals.css'
import '../styles/wikipedia-images.css'
import '../styles/hide-cse.css'


export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  )
}