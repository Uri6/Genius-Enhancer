<div align="center">

  <hr>

  <p><img src="https://i.ibb.co/qmK7XS2/transp-Github.png" style="transform: scale(0.8);"></p>
  <img src="https://img.shields.io/chrome-web-store/v/hnkhjljomklfcnfnbbikoddbolmpaifl?color=ffff65&label=Released%20Version&logo=Google%20Chrome&logoColor=white" alt="Released Version" style="max-width: 100%;">
  <img src="https://img.shields.io/chrome-web-store/rating/hnkhjljomklfcnfnbbikoddbolmpaifl?label=Chrome%20Web%20Store%20Rating" alt="Chrome Web Store Rating" style="max-width: 100%;">
  <a href="https://chrome.google.com/webstore/detail/hnkhjljomklfcnfnbbikoddbolmpaifl"><img src="https://badgen.net/badge/Download/%F0%9F%91%80/" alt="Download" style="max-width: 100%;"></a>

</div>

##

A Chrome extension featuring automation tools, productivity enhancements, and a modern style for Genius.com.

<hr>

## Features
- Streamline your workflow with automation tools such as:
  - Effortlessly adding credits & tags to each song in an album
  - Autofilling Youtube/SoundCloud links with a single playlist link
  - Instantly linking artwork with the auto-link artwork button
- Edit with ease using productivity enhancements like:
  - Color-coded brackets in the lyrics edit page
  - One-click reply button for suggestions
  - Alerts for missing bios & important metadata for each song on an album page
- A fresh, modern look and feel for Genius.com

## Installation
1. Download the extension from the [chrome web store](https://chrome.google.com/webstore/detail/hnkhjljomklfcnfnbbikoddbolmpaifl)

or

1. Clone the repository
```
git clone https://github.com/hackeagle/Genius-Enhancer.git
```

2. Install dependencies with `yarn install`
3. Compile the styles with `yarn build`
4. Optional: add Google or Spotify credentials to
   `src/js/extension/defaultSecrets.js` for local testing. Do not commit real
   credentials. The extension loads with those integrations disabled when the
   values are blank.
5. Load the extension in Chrome
    - Open up `chrome://extensions/` in your browser and click `Developer mode` in the top right
    - Click `Load unpacked` and select the `Genius-Enhancer` directory

Run `yarn check` after making changes. It verifies the JavaScript project and
ensures every file referenced by the extension exists.

## Usage
1. Go to Genius.com
2. Enjoy the enhanced experience

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
Please refer to the [LICENSE.md](/LICENSE.md) file in the root folder for the terms of use of this project.
