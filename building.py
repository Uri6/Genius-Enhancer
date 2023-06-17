import os
import shutil
import json
import csscompressor

def copytree(src, dst):
    sep = os.sep
    print(f'Copying {src} to {dst}')
    for folder in os.listdir(src):
        if not should_skip_folder(src, folder):
            if os.path.isdir(src + sep + folder):
                os.mkdir(dst + sep + folder)
                copytree(src + sep + folder, dst + sep + folder)
            else:
                file = folder
                if not should_skip_file(src + sep + file):
                    shutil.copy(src + sep + file, dst + sep + file)
                    if file.endswith('.css'):
                        compress_css_file(dst + sep + file)

def should_skip_folder(src, folder):
    if not os.path.isdir(src + os.sep + folder):
        return False
    bad_folders = [".vscode", ".git", ".github", "Builds", "vision", "header", "gifs", "screenshots", ".idea", ".yarn", ".venv", "arrows", "settings"]
    if folder in bad_folders:
        return True
    if src.endswith(os.sep + "icons") and folder in ["1", "2"]:
        return True
    if src.endswith(os.sep + "bio") or src.endswith(os.sep + "people") or src.endswith(os.sep + "releaseDate") or src.endswith(os.sep + "magicWand"):
        if folder == "1":
            return True
    return False

def should_skip_file(file):
    bad_files = [".py", ".ts", ".scss", ".psd", ".gitignore", ".gitattributes", "todo", "changelog.md", "compileAllSass.js", "postcssCompile.js", "tsconfig.json", "package.json", "yarn.lock", ".yarnrc.yml", ".prettierignore", ".env.example", ".env"]
    if any(file.endswith(bad_file) for bad_file in bad_files):
        return True
    nedded_dimensions = {"artwork": "512x512.png", "Exists": "64x64.png", "Missing": "64x64.png", "Simple": "32x32.png", "magicWand"+os.sep+"2": "32x32.png", "icons"+os.sep+"3": ("16x16.png", "32x32.png", "48x48.png", "128x128.png")}
    for folder, dimensions in nedded_dimensions.items():
        if folder in os.path.dirname(file):
            if isinstance(dimensions, str):
                if not file.endswith(dimensions):
                    return True
            elif isinstance(dimensions, tuple):
                if not any(file.endswith(dimension) for dimension in dimensions):
                    return True
    return False

def compress_css_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        print(f'Compressing {file_path}')
        data = csscompressor.compress(f.read())
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(data)

root_dir = os.path.dirname(os.path.realpath(__file__))
manifest = open('./manifest.json', 'r')
data = json.load(manifest)
version = data.get('version')
manifest.close()
dst_path = os.path.join(root_dir, 'Builds', version)
if os.path.exists(dst_path):
    shutil.rmtree(dst_path)
os.mkdir(dst_path)
copytree(root_dir, dst_path)
for file in os.listdir(os.path.join(root_dir, 'Builds')):
    if file.endswith('.zip'):
        os.remove(os.path.join(root_dir, 'Builds', file))
# delete all the empty folder in the new version folder
for folder in os.listdir(dst_path):
    if os.path.isdir(os.path.join(dst_path, folder)) and not os.listdir(os.path.join(dst_path, folder)):
        os.rmdir(os.path.join(dst_path, folder))
shutil.make_archive(dst_path, 'zip', dst_path)