TO EXPORT database:
1. pg_dump dbname > dbname.bak

TO IMPORT ft_transcendence database with empty users table:

1. dropdb ft_transcendence
2. createdb ft_transcendence
3. psql ft_transcendence < ft_transcendence.bak
