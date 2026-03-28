include .env
export

dump:
	docker compose exec mongo mongodump \
		--uri="mongodb://localhost:27017/users" \
		--out=/data/backup
	docker compose cp mongo:/data/backup ./backup

export-users:
	docker compose exec mongo mongoexport \
		--uri="mongodb://localhost:27017/users" \
		--collection=users \
		--out=/data/users.json
	docker compose cp mongo:/data/users.json ./users.json
