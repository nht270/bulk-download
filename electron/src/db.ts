import path from 'node:path'
import { DataTypes, Model, Op, Sequelize, WhereOptions } from 'sequelize'
import { DownloadItem } from './downloader'

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'db.sqlite'),
    logging: false
})

const DownloadHistory = sequelize.define<Model<DownloadItem, Omit<DownloadItem, 'id'>>>(
    'DownloadHistories',
    {
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        fileName: { type: DataTypes.STRING, allowNull: false },
        folderPath: { type: DataTypes.STRING, allowNull: false },
        link: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.STRING, allowNull: false },
        created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        fileSize: { type: DataTypes.INTEGER, defaultValue: 0 },
        fileType: { type: DataTypes.STRING, allowNull: true },
        errorMessage: { type: DataTypes.STRING, allowNull: true }
    },
    {
        createdAt: false,
        updatedAt: false,
    }
)

export default class Db {

    static async init() {
        await DownloadHistory.sync()
    }

    static async getDownloadHitories() {
        const getResults = await DownloadHistory.findAll({
            order: [['created', 'desc']]
        })
        return getResults.map(result => result.dataValues)
    }

    static async getDownloadHitoryByIds(ids: string[]) {
        const getResults = await DownloadHistory.findAll({
            where: { id: { [Op.in]: ids } }
        })

        return getResults.map(result => result.dataValues)
    }

    static async addDownloadHistory(...downloadHistories: DownloadItem[]) {
        const addResults = await DownloadHistory.bulkCreate(
            downloadHistories,
            { updateOnDuplicate: ['link', 'fileName', 'fileSize', 'fileType', 'created', 'errorMessage', 'folderPath'] }
        )
        return addResults
    }

    static async updateDownloadHistory(...downloadedItems: DownloadItem[]) {
        // DownloadHistory.update()
    }

    static async deleteDownloadHistory(...historyIds: string[]) {
        const whereOptions: WhereOptions<DownloadItem> = { 'id': { [Op.in]: historyIds } }

        const resultsWouldDelete = await DownloadHistory.findAll({
            where: whereOptions
        })

        const idsWouldDelete = resultsWouldDelete
            .map(result => result.dataValues)
            .map(history => history.id)

        await DownloadHistory.destroy({
            force: true,
            where: whereOptions,
        })

        return idsWouldDelete
    }
}