<template>
    <div>
        <NavBar/>
        <v-toolbar dense flat>

            <v-spacer></v-spacer>

            <v-text-field
                outlined 
                dense
                v-model="search"
                append-icon="mdi-magnify"
                :label="$t('Search...')"
                single-line
                hide-details
            ></v-text-field>

            <v-spacer></v-spacer>
            <v-btn @click="showRegisterUser()" color="primary" rounded dense small><v-icon small>mdi-plus-circle</v-icon>{{ $t('Register New User') }}</v-btn>
        </v-toolbar>

        <v-container fluid grid-list-lg>
            <v-data-table  
                dense
                :headers="userAccountTableHeader"
                :items="userList"
                :search="search"
                fill-height
                fixed-header
                height="440px"
                :loading="isLoading"
                style="border:1px solid grey;"
                >

                <template v-slot:item.account_status="{ item }">
                    <v-chip outlined small v-if="item.account_status === 'Active'" dark color="green">{{item.account_status}}</v-chip>
                    <v-chip v-else small dark outlined color="red">{{item.account_status}}</v-chip>

                    <!-- <v-chip :color="item.account_status = 'Active' ? green : 'red'" dark>{{item.account_status}}</v-chip> -->
                </template>

                <template v-slot:item.action="{ item }">

                    <v-btn small icon @click="viewDetails(item)">
                        <v-icon small color="green">
                            mdi-eye
                        </v-icon>
                    </v-btn>

                    <v-btn small @click="showEditUserAccountDialog(item)" class="mr-2" icon>
                        <v-icon
                            small
                            color="primary"
                        >
                            mdi-pencil-outline
                        </v-icon>
                    </v-btn>

                    <v-btn small icon @click="deleteUserAccount(item)">
                        <v-icon small color="red">
                            mdi-trash-can-outline
                        </v-icon>
                    </v-btn>

                </template> 
            </v-data-table>
        </v-container>

        

        <!-- DIALOGS -->
        <v-row justify="center">
            <v-dialog
                v-model="userDetailsDialog"
                max-width="420"
            >
                <v-card>
                    <v-card-title class="headline">{{ $t('User Account Information') }} <v-spacer></v-spacer>
                        <v-btn icon @click="userDetailsDialog = false"><v-icon>mdi-close</v-icon></v-btn>
                    </v-card-title>
                    <v-divider></v-divider>

                    <v-card-text class="mt-4">
                    <!-- {{accountDetails}} -->
                    <tr>
                        <th class="text-left">{{ $t('First Name') }}:</th>
                        <td class="text-center ">{{accountDetails.first_name}}</td>
                    </tr>
                    <tr>
                        <th class="text-left">{{ $t('Last Name') }}:</th>
                        <td class="text-center ">{{accountDetails.last_name}}</td>
                    </tr>
                    <tr>
                        <th class="text-left">{{ $t('Account Type') }}:</th>
                        <td class="text-center ">{{accountDetails.account_type}}</td>
                    </tr>
                    <tr>
                        <th class="text-left">{{ $t('Account Status') }}:</th>
                        <td class="text-center ">{{accountDetails.account_status}}</td>
                    </tr>
                    <tr>
                        <th class="text-left">{{ $t('Company Group') }}:</th>
                        <td class="text-center ">{{accountDetails.company_group}}</td>
                    </tr>
                    <tr v-if="accountDetails.company_group === 'GC'">
                        <th class="text-left">{{ $t('Company Sub-group') }}:</th>
                        <td class="text-center ">{{accountDetails.gc_subgroup}}</td>
                    </tr>
                    <tr class="text-left">
                        <th class="text-left">{{ $t('Username') }}:</th>
                        <td class="text-center">{{accountDetails.username}}</td>
                    </tr>
                    <tr>
                        <th class="text-left">{{ $t('Password') }}:</th>
                        <td class="text-center">{{accountDetails.password}}</td>
                    </tr>
                    <tr>
                        <th class="text-left">{{ $t('Date Registered') }}:</th>
                        <td class="text-center">{{accountDetails.date_registered}}</td>
                    </tr>
                    <tr>
                        <th class="text-left">{{ $t('Registered By') }}:</th>
                        <td class="text-center">{{accountDetails.registered_by}}</td>
                    </tr>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-row>

        <v-row justify="center">
            <v-dialog
                v-model="registerUserDialog"
                persistent :overlay="false"
                max-width="600px"
                transition="dialog-transition"
                >
                <v-card  class="pa-1">
                    <v-card-title class="font-weight-light" primary-title>
                       {{ $t(formTitle) }}
                        <v-spacer></v-spacer>
                        <v-btn icon @click="closeDialog()"><v-icon>mdi-close</v-icon></v-btn>
                    </v-card-title>
                    <v-divider class="mr-2 ml-2 mb-2"></v-divider>
                    <small class="caption ma-2">{{ $t('*Empty fields are prohibited.Use (-) instead.') }}</small>
                    <v-card-text>
                        <v-row class="mt-3" justify="center">
                            <v-text-field
                                class="mr-2"
                                :label="$t('First Name')"
                                v-model="toRegister.first_name"
                                outlined
                                dense
                            ></v-text-field>

                            <v-text-field class="mr-2"
                                :label="$t('Last Name')"
                                v-model="toRegister.last_name"
                                outlined
                                dense
                            ></v-text-field>

                            <v-text-field class="mr-2"
                                style="width:30%"
                                :label="$t('Email')"
                                type="email"
                                v-model="toRegister.email"
                                outlined
                                dense
                            ></v-text-field>

                            <v-select class="mr-2"
                                style="width:35%"
                                :items="accountTypes"
                                :label="$t('Account Type')"
                                outlined
                                v-model="toRegister.account_type"
                                dense
                            ></v-select> 

                            <v-select class="mr-2"
                                style="width:20%"
                                :items="subGroupList"
                                :label="$t('GC Sub-group')"
                                outlined
                                v-model="toRegister.gc_subgroup"
                                dense
                                v-if="toRegister.account_type === 'GC Leader' || toRegister.account_type === 'GC Member'"
                            ></v-select> 
                            
                            <v-col cols="6">
                                <span>{{ $t('Account Status') }}:</span>
                                <v-radio-group label="" row class="mr-2 mt-0"  v-model="toRegister.account_status">
                                    <v-radio :label="$t('Active')" value="Active"></v-radio>
                                    <v-radio :label="$t('Inactive')" value="Inactive"></v-radio>
                                </v-radio-group>  
                            </v-col>

                             <v-col cols="6">
                                <span>{{ $t('Company Group') }}:</span>
                                <template v-if="toRegister.account_type === 'HRD Admin' || toRegister.account_type === 'HRD User'">
                                    <h4>HRD</h4>
                                </template>

                                <template v-else-if="toRegister.account_type === 'GC Leader' || toRegister.account_type === 'GC Member'">
                                    <h4>GC</h4>
                                </template>

                                <template v-else>
                                    <h4>{{ $t('Please Select Account Type') }}</h4>
                                </template>
                            </v-col>

                            <v-text-field class="mr-2"
                                :label="$t('Username')"
                                v-model="toRegister.username"
                                outlined
                                dense
                            ></v-text-field>

                            <v-text-field class="mr-2"
                                :label="$t('Password')"
                                v-model="toRegister.password"
                                type="password"
                                outlined
                                dense
                            ></v-text-field>
                        
                            <v-btn class="mt-4" @click="saveUser()" block color="primary" dark>{{$t('Save User')}}</v-btn>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-row>

       
        
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import moment from 'moment'
export default {
    components:{
        NavBar
    },
    data(){
        return{
            userAccountTableHeader:[
                 {
                    text: 'Account Type',
                    align: 'left',
                    sortable: true,
                    value: 'account_type'
                },
                { text: 'Account Status', value: 'account_status'},
                { text: 'Work Email', value: 'email', align: 'center'},
                { text: 'Username', value: 'username', align: 'center'},
                { text: 'Password', value: 'password', align: 'center'},
                { text: 'Actions', value: 'action', align: 'center', sortable: false},
            ],
            isLoading:true,
            search: '',
            userList: [],
            registerUserDialog: false,
            toRegister: {},
            formTitle: '',
            accountTypes: ['HRD Admin','HRD User','GC Leader','GC Member'],
            subGroupList: ["GC1", "GC2", "GC3", "GC4", "GC5", "GC6", "GC7", "GC8", "GC9"],
            accountDetails: [],
            userDetailsDialog: false,
        }
    },
    methods:{
        showEditUserAccountDialog(item){
            this.registerUserDialog = true;
            this.formTitle = 'Edit User Account Information';
            this.toRegister = item
            
            
        },
        viewDetails(item){
            this.userDetailsDialog = true
            this.accountDetails = item
        },
        deleteUserAccount(item){
            let conf = confirm('DELETE this User Account?')
            if(conf === true){
                let indexToDelete = this.userList.indexOf(item)
                this.userList.splice(indexToDelete, 1)
                let url = `${this.aws}deleteUserAccount/${item.username}`
                this.axios.delete(url).then(res => {
                    alert(res.data)
                    this.loadUsers();
                })
            }else{
                this.loadUsers()
            }
        },
        saveUser(){
            if(this.formTitle === 'Register New User'){
                let url = `${this.aws}registerUser`;
                if(this.toRegister.account_type === 'HRD Admin' || this.toRegister.account_type === 'HRD User'){
                    this.toRegister.company_group = 'HRD'
                }else{
                    this.toRegister.company_group = 'GC'
                }
                this.toRegister.date_registered = moment().format('LLL');
                this.toRegister.registered_by = this.userInfo.email
                this.axios.post(url, this.toRegister).then(res => {
                    alert(res.data)
                    this.toRegister = {}
                    this.registerUserDialog = false
                    this.loadUsers()
                })
            }else{
                 let url = `${this.aws}updateUserAccount`;
                this.axios.put(url, this.toRegister).then(res => {
                    alert(res.data)
                    this.toRegister = {}
                    this.registerUserDialog = false
                })
            }
            
        },
        loadUsers(){
            let url = `${this.aws}getUsers`;
            this.axios.get(url).then(res => {
                this.userList = res.data
                this.isLoading = false
            })
        },
        showRegisterUser(){
            this.registerUserDialog = true
            this.formTitle = 'Register New User'
        },
        closeDialog(){
            this.registerUserDialog = false
            this.toRegister = {}
            this.loadUsers()
        }
      
    },
    created(){
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
        this.loadUsers()
    }
}
</script>