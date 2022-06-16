export type UnsplashImage = {
  id: string
  createdAt: string
  updatedAt: string
  width: string
  height: string
  color: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
    small_s3: string
  }
  links: {
    self: string
    html: string
    download: string
    download_location: string
  }
}
