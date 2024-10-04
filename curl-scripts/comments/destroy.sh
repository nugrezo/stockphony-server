API="http://localhost:4741"
URL_PATH="/examples"

curl "${API}${URL_PATH}/${ID}/comments/${EXAMPLEID}" \
  --include \
  --request DELETE \
  --header "Authorization: Bearer ${TOKEN}"

echo
