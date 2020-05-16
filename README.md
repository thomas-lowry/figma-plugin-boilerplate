# Figma Plugin Boilerplate (FPB)
 A starter project for creating Figma Plugins with HTML, CSS (+ SCSS) and vanilla Javascript without any frameworks. It comes pre-setup with a UI library that matches the Figma UI, refer to the [Figma Plugin DS](https://github.com/thomas-lowry/figma-plugin-ds) documentation for usage.

## Contents
* [Intro](#intro)
* [What is this and how will it make my life easier](#what-is-this-and-how-will-it-make-my-life-easier)
* [Getting started](#getting-started)
* [FAQ](#faq)

## Intro

**Goal**—I wanted to create an easy to use starting point for anyone interested in creating a Figma Plugin. If you are comfortable with HTML, CSS, and know a bit of native Javascript, this is designed to help you get a simple performant plugin off the ground. No messing around with any UI frameworks!


**Why**—When creating a Figma Plugin, one of the constraints is the inability to link to any external scripts, or assets outside of your core plugin files. This means, if you have a folder of images, an external stylesheet, or an external javascript file for your plugin's UI, you cannot link to them. These assets need to either be hosted somewhere on the web, or they need to be bundled into one file. So instead of writing your css in a .css or .scss file, you would need to write everything inside the head tag. This is why many developers opt to use Javascript frameworks and bundlers like Webpack or Rollup—but this way often forces you into doing things in a very Javascript centric way which is not always easy to grasp when you want to use the languages you're already familiar with.


**What**—To simplify this, this boilerplate is already setup with a build configuration specifically for writing Figma Plugins. You can write HTML in the `src/ui/index.html` file, plain old CSS inside the `src/ui/styles/styles.scss` file, and native Javascript inside the `src/ui/js/scripts.js` file. If you want a .png or an .svg in your UI (`index.html`), just place it in the `src/ui/img` directory and reference it as your normally would. When ready, executing the build script will automically inline and bundle all of your external scripts and assets into a single minified .html file in the `dist` directory.

This boilerplate is a pre-configured build process (using a toolkit called Gulp) that makes writing your first plugin easier and faster. If you have never used a build process, it will enables you to approach your plugin in the same way you might approach a basic website. Then by running a single command, it will automate a bunch of stuff behind the scenes to translate your plugin into a finished state ready for use in Figma so that you don't have to do any manual grunt work or change your approach to writing code.


### Whats included
- Pre-configured structure and example user-interface (html, css, and javascript)—located in the `src/ui` directory
- Pre-configured structure of your plugin code (this is the part of your plugin that interfaces with the Figma API)—located in the `src/main` directory
- Already configured with a set of UI components from Figma Plugin DS that match the Figma UI (see the Figma Plugin DS documentation for usage)
- Build process that will:
    - Inline all of your external assets including: css, javascript, and images (raster images will be base64 encoded, and SVGs included inline)
    - Minify all of your code for a small bundle size
    - Eliminate any of your CSS that is not used


**Using the terminal / command line interface**

Typing in commands to the terminal can feel intimidating. I know it scared me away from going deeper for many years. You don't need to be an expert and there is only four commands that you will need to enter to get started!

**Note** _This starter boilerplate is not setup to support importing and bundling ES6 modules at the current time._

## Getting started

If this is your first time doing anything like this, you will need to download and install [NodeJs](https://nodejs.org/en/) first. If you're looking for a code editor, I highly recommend [VS Code](https://code.visualstudio.com/) by Microsoft. It as an build-in command line terminal and makes it really easy to get started.

### Step 1
Create a copy of this boilerplate project on your local drive. You can do so by downloading a zip from the green 'Clone or download' button. Or if you are already familiar with the command line, you can enter:
```bash 
git clone https://github.com/thomas-lowry/figma-plugin-boilerplate.git
```
or, if you don't want the download entire Git history:
```bash 
npx degit thomas-lowry/figma-plugin-boilerplate my-plugin
```

### Step 2

Next you will need to run a terminal command to install this project's dependencies. If you're unfamiliar with this concept, this just downloads bunch of scripts required for the boilerplate to work properly. 

If you're using VS Code, you can `File → Open Workspace` and choose the folder where you cloned the project to. Alternatively, in OSX, you can just drag the folder from Finder onto the VS Code icon in your dock. From here you will need to open the terminal, `Terminal → New Terminal`.

Now you can enter the command to install it:
```bash 
npm install
```

### Step 3

Now that you have the project and all the dependencies installed, you can start developing. To start working on your project, enter the following command into the terminal:
```bash 
npm run dev
```

This puts the project into development mode which will watch any of the files you're working on for changes. Next time you save an edit to HTML, CSS, Javascript, or add in some img assets, the plugin will automatically build a new version. Your plugin will get assembled in the `dist` directory. This is the directory you will point Figma to when installing the plugin locally.

### Step 4

Okay, so you're done creating your plugin and it's ready for use or to be submitted to Figma. What's next? There is just one more command to run. This command will build the final version of your plugin and minify all of your code, and remove any unused CSS, to reduce it down to the smallest file size possible.
```bash 
npm run build
```


## FAQ

**I noticed the main plugin code is a .ts file, what's that?!**
That is a Typescript file—Typescript is a stricter way of writing Javascript that uses leverages definitions from the API you're writing code for, to help flag errors while you're writing code. On the surface, this seems like a new language that you need to learn, but it's really not. Typescript will get compiled to Javascript when you run the build, so you can just write Javascript in this file.

The good news is that this can really help you in a couple of major ways. First, the definitions in the `src/main/figma.d.ts` file will allow your code editor to autocomplete the code you're writing with suggestions specific to the Figma API. This can save you time and from making mistakes like typos. Second, the squiggly underlines or errors you get can help flag parts of your code that may break when you run it. For example, you may try to do modify something about a node the user has selected on the Figma canvas. If you tried to access a property like `cornerRadius` on a selection, Typescript would flag an error `Property 'cornerRadius' does not exist on type 'SceneNode'.`. Why? Because not every node is guaranteed to have a `cornerRadius` property. It can help you ensure that you're writing code with good error handling and type checking so that your code doesn't break. The [Figma Plugin API](https://www.figma.com/plugin-docs/typescript/) documentation has a great deep dive that goes into WAY more details.
