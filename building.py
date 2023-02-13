import os
import shutil
import json
import csscompressor

def add_license_comment(directory):
    license_comment = """/*
* This code is licensed under the terms of the "LICENSE.md" file
* located in the root directory of this code package.
*/"""
    HTML_comment = """<!--
* This code is licensed under the terms of the "LICENSE.md" file
* located in the root directory of this code package.
-->"""
    lib_comment = """/*
* This code was not written by me (Uri Sivani) and is subject to the license of the original project.
* Please refer to the original project website for more information.
*/"""
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".js") or file.endswith(".css"):
                file_path = os.path.join(root, file)
                if "lib" in root.split("\\"):
                    comment = lib_comment
                else:
                    comment = license_comment
                with open(file_path, "rb") as f:
                    lines = f.read().decode("utf-8")
                lines = comment + "\n\n" + lines
                with open(file_path, "wb") as f:
                    f.write(lines.encode("utf-8"))
            elif file.endswith(".html"):
                file_path = os.path.join(root, file)
                with open(file_path, "rb") as f:
                    lines = f.read().decode("utf-8")
                lines = HTML_comment + "\n\n" + lines
                with open(file_path, "wb") as f:
                    f.write(lines.encode("utf-8"))

def encrypt(file):
    # check if it is a file: if it is a file, encrypt it; if it is a folder, call this function with the folder as the parameter
    if not os.path.isfile(file):
        for item in os.listdir(file):
            encrypt(file + '/' + item)
        return
    print('Encrypting {}'.format(file))
    if file.endswith('.js'):
        pass
    elif file.endswith('.css'):
        with open(file, 'r') as f:
            data = csscompressor.compress(f.read())
        with open(file, 'w') as f:
            f.write(data)

def copytree(src, dst):
    src = src.replace('/', '\\')
    dst = dst.replace('/', '\\')
    print('Copying {} to {}'.format(src, dst))
    for folder in os.listdir(src):
        skip = False
        bad_folders = [".vscode", ".git", "Builds", "vision", "header", "gifs"]
        if folder in bad_folders or src.endswith("\\icons") and folder == "1":
            continue
        if os.path.isdir(src + '\\' + folder):
            # call this function
            os.mkdir(dst + '\\' + folder)
            copytree(src + '\\' + folder, dst + '\\' + folder)
        else:
            file = folder
            bad_files = [".py", ".map", ".scss", ".sass", ".psd", "changelog.md"]
            for bad_file in bad_files:
                if file.endswith(bad_file):
                    skip = True
            nedded_dimensions = {"artwork": "512x512.png", "Exists": "48x48.png", "Missing": "48x48.png", "icons\\2": ["16x16.png", "32x32.png", "48x48.png", "128x128.png"]}
            for key in nedded_dimensions:
                if src.endswith(key):
                    if type(nedded_dimensions[key]) == list:
                        if file not in nedded_dimensions[key]:
                            skip = True
                    else:
                        if file != nedded_dimensions[key]:
                            skip = True
            if not skip:
                shutil.copy(src + '\\' + file, dst + '\\' + file)

geniusBot_path = os.path.dirname(os.path.realpath(__file__))

manifest = open('D:/Projects/ChromeExtensions/GeniusEnhancer/manifest.json', 'r')

data = json.load(manifest)
version = data.get('version')

manifest.close()

dst_path = geniusBot_path + '/Builds/' + version

if os.path.exists(dst_path):
    shutil.rmtree(dst_path)

os.mkdir(dst_path)

copytree(geniusBot_path, dst_path)

encrypt(dst_path)

add_license_comment(dst_path)

# remove any .zip files in the Builds folder
for file in os.listdir(geniusBot_path + '/Builds'):
    if file.endswith('.zip'):
        os.remove(geniusBot_path + '/Builds/' + file)

# zip the folder
shutil.make_archive(dst_path, 'zip', dst_path)