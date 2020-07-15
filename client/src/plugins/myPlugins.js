import { mapState } from 'vuex'
import S3 from 'aws-s3';
import moment from 'moment';
import shortid from 'shortid';
const myPlugin = {
    install(Vue){
        Vue.mixin({
            data: () => ({
              //  aws: 'http://localhost:3001/',
              aws:`https://9rk5no11y2.execute-api.us-east-2.amazonaws.com/prod/`,
              gcPortalSubject: `GC PORTAL NOTIFICATION -`,
              gcPortalLink:`
                <b>GC Portal Link:</b>
                <br>
                <a href="http://gcportal-testbucket.s3-website.us-east-2.amazonaws.com/ja/SignIn">http://gcportal-testbucket.s3-website.us-east-2.amazonaws.com/ja/SignIn</a>
              `,
               emailOptions: {},
               enableEmailNotif: true,
               enabledFileAttachment: false,
               notificationSystem: {
                options: {
                  show: {
                    theme: "dark",
                    icon: "icon-person",
                    position: "topCenter",
                    progressBarColor: "rgb(0, 255, 184)",
                    // buttons: [
                    //   [
                    //     "<button>Ok</button>",
                    //     function(instance, toast) {
                    //       alert("Hello world!");
                    //     },
                    //     true
                    //   ],
                    //   [
                    //     "<button>Close</button>",
                    //     function(instance, toast) {
                    //       instance.hide(
                    //         {
                    //           transitionOut: "fadeOutUp",
                    //           onClosing: function(instance, toast, closedBy) {
                    //             console.info("closedBy: " + closedBy);
                    //           }
                    //         },
                    //         toast,
                    //         "buttonName"
                    //       );
                    //     }
                    //   ]
                    // ],
                    // onOpening: function(instance, toast) {
                    //   console.info("callback abriu!");
                    // },
                    // onClosing: function(instance, toast, closedBy) {
                    //   console.info("closedBy: " + closedBy);
                    // }
                  },
                  ballon: {
                    balloon: true,
                    position: "bottomCenter"
                  },
                  info: {
                    position: "bottomLeft"
                  },
                  success: {
                    position: "bottomRight"
                  },
                  warning: {
                    position: "topLeft"
                  },
                  error: {
                    position: "topRight"
                  },
                  question: {
                    timeout: 20000,
                    close: false,
                    overlay: true,
                    toastOnce: true,
                    id: "question",
                    zindex: 999,
                    position: "center",
                    // buttons: [
                    //   [
                    //     "<button><b>YES</b></button>",
                    //     function(instance, toast) {
                    //       instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                    //     },
                    //     true
                    //   ],
                    //   [
                    //     "<button>NO</button>",
                    //     function(instance, toast) {
                    //       instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                    //     }
                    //   ]
                    // ],
                    // onClosing: function(instance, toast, closedBy) {
                    //   console.info("Closing | closedBy: " + closedBy);
                    // },
                    // onClosed: function(instance, toast, closedBy) {
                    //   console.info("Closed | closedBy: " + closedBy);
                    // }
                  }
                }
              },
              thumbnail: 'test',
              imageData: "",
              input: {},
              fileExtension:'',
              fileToUpload:{},
              fileURL: ``,
              uploadObject:{},
              fileData: {},
            }),
            methods: {
              getFile(){
                ////Getting the file type of a file
                this.fileExtension = this.uploadObject.type.split('/')[1]
                ////Complete path/url of a file
                this.fileURL = `${this.url}.${this.fileExtension}`;
    
                this.fileData.file_id = shortid.generate();
                this.fileData.filename = this.uploadObject.name;
                this.fileData.date_added = moment().format('L');
                this.fileData.file_path = this.fileURL;
                this.fileData.uploaded_by = this.userInfo.email;
                console.log(this.fileData.file_path)
            },
              //FUNCTION FOR UPLOADING FILES TO S3 BUCKET
              uploadFile(){
                this.S3Client
                .uploadFile(this.uploadObject, this.newFileName).finally(() => {
                  this.fileExtension = this.uploadObject.type.split('/')[1]
                  this.fileURL = `${this.url}.${this.fileExtension}`;
                  this.uploadObject = {}
                  console.log('uploaded')
                })

              },
              // FUNCTION FOR SENDING EMAIL NOTIFICATION
              sendEmailNotif() {
                if(this.enableEmailNotif === true){
                  console.log('======= EMAIL TO SEND ========')
                  console.log(this.emailOptions)

                  let url = `${this.aws}sendNotif`
                  this.axios.post(url, this.emailOptions).then(res => {
                    console.log(res.data)
                    console.log('======= EMAIL TO SEND ========')
                    console.log(this.emailOptions)
                  })
                }
              }
            },
            computed:{
              ...mapState([
                'titlePage',
                'userInfo',
                'fileInfo',
                'confirmationInfo',
                'confirmationIndex',
                'revisedRingi'
              ]),
              //AWS CONFIGURATION
              config(){
                return {
                  bucketName: 'gcportal-testbucket',
                  dirName: this.directory, //Optional --> directory or folder on s3 where the file will be saved.
                  region: 'us-east-2', //aws region.
                  accessKeyId: 'AKIA2FWIWPI5YHRQVOEX', //ACCESS KEY ID OF YOUR IAM User.
                  secretAccessKey: 'IF/oSzn4FAEuovN8uZVgR5Tvdf9WZlkYwIQFLYjv', //SECRET ACCESS KEY ID OF YOUR IAM User.
                  s3Url: this.baseURL //Optional --> url of your s3 bucket.
                }
              },
              S3Client(){
                return new S3(this.config)
              },
              baseURL(){
                //URL OF YOUR BUCKET
                return 'https://gcportal-testbucket.s3.us-east-2.amazonaws.com'
              },
              newFileName(){
                //returns a random numbers for the new filename
                return Math.random().toString().slice(2);
              },
              directory(){
                return 'uploaded_files'
              },
              url(){
                return `${this.baseURL}/${this.directory}/${this.newFileName}`;
              }

            },
            created(){
              //API KEY
              this.axios.defaults.headers.common['x-api-key'] = 'yrzZIOXHw5M3creXNV63amuXO5pEAIxJubqiDn70';
            }
        })
    }
}

export default myPlugin 