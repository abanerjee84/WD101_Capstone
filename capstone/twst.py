import requests
import json
import os
import csv
import time


## GET RESPONSES
def get_responses(link):
    '''
    Get json data from link
    '''
    response = requests.get(link, headers=headers)
    json_dump = response.json()
    return json_dump


## EXTRACT DATA FROM JSON
def get_data(data):
    '''
    RETURN LIST OF JSON PARSED
    '''
    number = data['number']
    title = data['title']
    date = data['created_at']
    author = data['user']['login']
    comment_main = data['body']
    try:
        comment_links = data["_links"]["comments"]["href"]
    except:
        comment_links = ""
    try:
        review_comment_links = data["_links"]["review_comments"]["href"]
    except:
        review_comment_links = ""
    
    return [number,title,date,author,comment_main,comment_links,review_comment_links]
      
def get_data_sub(data):
    '''
    RETURN LIST OF JSON PARSED ## SUB
    '''
    date = data['created_at']
    author = data['user']['login']
    comment_main = data['body']
    return [date,author,comment_main]




## FETCH RECORDS
def fetch_records(owner,repo):

    ### CHECK IF OUTPUT FILE EXISTS
    if os.path.exists("output.csv"):
        f = open("output.csv","a")
        writer = csv.writer(f)
    else:
        f = open("output.csv","w")
        writer = csv.writer(f)
        writer.writerow(["REPO NAME","REPO OWNER","PR.NO","AUTHOR","TITLE","DATE","COMMENT","LEVEL"])

    owner_name=owner ## REPO OWNER
    repo_name = repo ## REPO NAME

    link = f"https://api.github.com/repos/{owner_name}/{repo_name}/pulls"
    print(link)
    # data=get_responses(link)[0]
    # with open('data.json', 'w') as f:
    #     json.dump(data, f)

    data=get_responses(link)
    print(len(data))
    if len(data) ==0:
        return 0
    for i in range(len(data)):
        ## MAIN BRANCH COMMENTS
        try:
            [number,title,date,author,comment_main,comment_links,review_comment_links] = get_data(data[i])

            print("{:20s}:{}".format("PR NUMBER",str(number)))
            print("{:20s}:{}".format("DATE",str(date)))
            print("{:20s}:{}".format("AUTHOR",author))
            print("{:20s}:{}".format("COMMENT",comment_main))
            print()
            
            writer.writerow([repo_name,owner_name,number,author,title,date,comment_main,"0"])
            
            
            try:
                ## CHECK IF SUB COMMENTS
                if comment_links!="":
                    response = requests.get(comment_links, headers=headers)
                    data2 = response.json()
                    if len(data2)>0:
                        for j in range(len(data)):
                            [date,author,comment_main] = get_data_sub(data2[j])
                            print("{:20s}:{}".format("PR NUMBER",str(number)))
                            print("{:20s}:{}".format("DATE",str(date)))
                            print("{:20s}:{}".format("AUTHOR",author))
                            print("{:20s}:{}".format("COMMENT",comment_main))
                            print()

                            writer.writerow([repo_name,owner_name,number,author,title,date,comment_main,"1"])
                        
                ## CHECK IF REVIEW COMMENTS
                if review_comment_links!="":
                    response = requests.get(review_comment_links, headers=headers)
                    data3 = response.json()
                    if len(data3)>0:
                        for k in range(len(data)):
                            [date,author,comment_main] = get_data_sub(data3[k])
                            print("{:20s}:{}".format("PR NUMBER",str(number)))
                            print("{:20s}:{}".format("DATE",str(date)))
                            print("{:20s}:{}".format("AUTHOR",author))
                            print("{:20s}:{}".format("COMMENT",comment_main))
                            print()

                            writer.writerow([repo_name,owner_name,number,author,title,date,comment_main,"2"])
            except:
                pass

            f.close() ## CLOSE WRITER
            return 0
        except:
            print("API RATE LIMIT EXCEEDED ... WAIT 5 minutes")
            return -1


########## MAIN ##################
if __name__=="__main__":

    ## GITHUB TOKEN
    f = open("api.conf","r") ## READ CONFIG
    rr = f.read()
    f.close()

    api_token = rr.split("\n")[0]
    print(api_token)
    headers = {'Authorization': 'token %s' % api_token}

    with open('input.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        rows = list(csv_reader)

        ret = 0
        while 1:
            row = rows[line_count] ## GET ROW
            if line_count == 0:
                print(f'Column names are {", ".join(row)}')
                line_count += 1
            elif line_count==len(rows):
                print("COMPLETED")
                break
            else:
                repo = row[0]
                owner = row[1]
                ret = fetch_records(owner,repo) ## FETCH RECORDS
                
                if ret==0:
                    line_count += 1
                else:
                    time.sleep(60)

                time.sleep(10) ## AVOID API TIMEOIUT

        print(f'Processed {line_count} lines.')

