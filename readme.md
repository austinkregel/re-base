# What is this?

Rebase is inspired specifically by Koding, C9, and Ice Editor.

This project has existed in various forms over the last decade, mostly living in my brain, and poorly executed demos.

## What does it do?
This project is meant to be a self-contained code editor. I know there are the hackable likes of VScode, sublime, and many many others, but this is is just a playground to learn.

It'll likely contain bad programming practices, thoughts not fully thought through, and incomplete or buggy code.

## How does it work?
Presently, it "works" :joy:, it's not fully featured by a long shot, but it does have a basic http api for reading/update/deleting files and folders.

This currently uses NodeJS.

## What are the goals/features?

I would like for this project to be an IDE that can be used with any system that can run NodeJS.

 - [ ] An Agent to act as our file interface
 - [ ] Ace (or alternative) editor for editing files
 - [ ] Ability to create, edit, delete files from the UI, Copy/Paste
 - [ ] Ability to partially recognize file types and blacklist file types known to be binary files, or rather large files to prevent the page from crashing
 - [ ] A way for our agents to be discovered, or be identified by the UI, or otherwise being able to have our agents connect to a server and have that server relay everything to the agents from the UI.
 - [ ] intellisense inspired completion
 - [ ] A terminal, or some kind of terminal like interface for running programs
 - [ ] Custom key bindings
 - Optimize/Refactor -- Meant to be done when things are more flushed out, clean up the code, remove duplications, see where things can be improved upon.

### Supported languages 
   - [ ] JavaScript
   - [ ] PHP
   - [ ] Shell/Bash scripts
   - [ ] Json
   - [ ] HTML/Vue 
   - [ ] CSS
   - [ ] Others...?


