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
  -- This code is licensed under the terms of the "LICENSE.md" file
  -- located in the root directory of this code package.
  -->"""
    lib_comment = """/*
 * This code was not written by me (Uri Sivani) and is subject to the license of the original project.
 * Please refer to the original project website for more information.
 */"""
    for root, dirs, files in os.walk(directory):
        if "Builds" not in root.split("\\"):
            for file in files:
                if file.endswith(".js") or file.endswith(".css") or file.endswith(".scss") or file.endswith(".sass") or file.endswith(".css.map"):
                    file_path = os.path.join(root, file)
                    if "lib" in root.split("\\"):
                        comment = lib_comment
                    else:
                        comment = license_comment
                    with open(file_path, "rb") as f:
                        lines = f.read().decode("utf-8")
                    if not lines.startswith(comment) and not lines.startswith('@charset "UTF-8";'):
                        lines = comment + "\n\n" + lines
                        with open(file_path, "wb") as f:
                            f.write(lines.encode("utf-8"))
                elif file.endswith(".html"):
                    file_path = os.path.join(root, file)
                    with open(file_path, "rb") as f:
                        lines = f.read().decode("utf-8")
                    if not lines.startswith(HTML_comment):
                        lines = HTML_comment + "\n\n" + lines
                        with open(file_path, "wb") as f:
                            f.write(lines.encode("utf-8"))


def copytree(src, dst):
    if os.name == 'nt':  # for Windows
        src = src.replace('/', '\\')
        dst = dst.replace('/', '\\')
        sep = '\\'
    else:  # for Mac
        sep = '/'
    print('Copying {} to {}'.format(src, dst))
    for folder in os.listdir(src):
        skip = False
        bad_folders = [".vscode", ".git", ".github",
                       "Builds", "vision", "header",
                       "gifs", "screenshots", ".idea",
                       ".yarn", ".venv"]
        if folder in bad_folders or src.endswith(sep + "icons") and folder == "1":
            continue
        if os.path.isdir(src + sep + folder):
            os.mkdir(dst + sep + folder)
            copytree(src + sep + folder, dst + sep + folder)
        else:
            file = folder
            bad_files = [".py", ".ts", ".map", ".scss", ".sass",
                         ".psd", ".gitignore", "todo", "changelog.md",
                         "tsconfig.json", "package.json", "yarn.lock",
                         ".yarnrc.yml", ".prettierignore", ".env.example",
                         ".env"]
            for bad_file in bad_files:
                if file.endswith(bad_file):
                    skip = True
            nedded_dimensions = {"artwork": "512x512.png", "Exists": "48x48.png", "Missing": "48x48.png", "icons"+sep+"2": [
                "16x16.png", "32x32.png", "48x48.png", "128x128.png"]}
            for key in nedded_dimensions:
                if src.endswith(sep + key):
                    if type(nedded_dimensions[key]) == list:
                        if file not in nedded_dimensions[key]:
                            skip = True
                    else:
                        if file != nedded_dimensions[key]:
                            skip = True
            if not skip:
                shutil.copy(src + sep + file, dst + sep + file)
                # if its css file, compress it
                if file.endswith('.css'):
                    with open(dst + sep + file, 'r', encoding='utf-8') as f:
                        print('Compresing {}'.format(dst + sep + file))
                        data = csscompressor.compress(f.read())
                    with open(dst + sep + file, 'w', encoding='utf-8') as f:
                        f.write(data)


rootDir = os.path.dirname(os.path.realpath(__file__))

manifest = open('./manifest.json', 'r')

data = json.load(manifest)
version = data.get('version')

manifest.close()

dst_path = rootDir + '/Builds/' + version

# add_license_comment(rootDir)

if os.path.exists(dst_path):
    shutil.rmtree(dst_path)

os.mkdir(dst_path)

copytree(rootDir, dst_path)

# remove any .zip files in the Builds folder
for file in os.listdir(rootDir + '/Builds'):
    if file.endswith('.zip'):
        os.remove(rootDir + '/Builds/' + file)

# zip the folder
shutil.make_archive(dst_path, 'zip', dst_path)
