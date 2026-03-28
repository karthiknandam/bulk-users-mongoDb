include .env
export

dump:
	mongodump --uri="$(MONGO_URI)" --out=backup/

export-users:
	mongoexport --uri="$(MONGO_URI)" \
		--collection=users \
		--out=users.json
