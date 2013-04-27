import json
import urllib
import urllib2

schools = json.loads(open("src_json.py").read())

school = schools[0]
print school

url = 'http://ancient-wave-9102.herokuapp.com/school'

for school in schools:
	print school
	data = urllib.urlencode(school)
	req = urllib2.Request(url, data)
	response = urllib2.urlopen(req)
	print response.read()

# for school in schools:
# 	print school["domain"]
# 	print school["name"]