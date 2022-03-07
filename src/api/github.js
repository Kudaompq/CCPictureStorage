import axios from "@/utils/axios"

export function getUserInfo(token){
    return axios({
        url: '/user',
        method: 'GET',
        headers: {
            Authorization: `token ${token}`
        }
    })
}

export function getUserRepos(name){
    return axios({
        url: `/users/${name}/repos`,
        method: 'GET'
    })
}

// 获取用户仓库下指定目录的文件列表
export function getReposContents(name, repos, path) {
    return axios({
        url: `/repos/${name}/${repos}/contents${path}`,
        method: 'GET'
    })
}

// 删除文件
export function delFile(name, repos, filePath, data) {
    return axios({
        url: `/repos/${name}/${repos}/contents/${filePath}`,
        method: 'DELETE',
        data
    })
}

// 上传文件至仓库指定目录下
export function upload(name, repos, path, fileName, data) {
    return axios({
        url: `/repos/${name}/${repos}/contents${path}/${fileName}`,
        method: 'PUT',
        data
    })
}