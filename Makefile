deploy :
	jekyll build --config _prod.yml --destination _prod
	rsync -rLvz _prod/ deploy@probmods.org:/var/www/chapters/v2