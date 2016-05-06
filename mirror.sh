jekyll build --config _corn.yml --destination _corn
rsync --exclude=".git" -rLvz _corn/* corn:~/WWW/pm3
