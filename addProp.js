var fs = require( 'fs' );
var q = require( 'q' );

// var source = '../SubCategories/SubCategoriesList.json';
var source = './SubCategories/SubCategoriesList.json';

loadAsinc( source ).then( function( subCatList ) {

    ChangeSkills( subCatList, particularSkills );

} );

function ChangeSkills( subCatList, skillsArr ) {  
    
    var partSubCatList = {};
    
    skillsArr.forEach( function( skill ) {
    
        if( partSubCatList[ skill.subCategory ] === undefined ) {
        
            var index = IndexOfSC( subCatList, skill.subCategory );
        
            if( index === -1 ) {
        
                console.log( skill.subCategory + ' not found in list' );
        
            } else {
        
                partSubCatList[ skill.subCategory ] = {};
                partSubCatList[ skill.subCategory ].path = subCatList[ index ].path;
                partSubCatList[ skill.subCategory ].listChange = [ skill ];
            
            }
        
        } else {

            partSubCatList[ skill.subCategory].listChange.push( skill );            
      
        }        
    
    } );
    
    var partSubCatListKeys = Object.keys( partSubCatList );
    
    for( var i = 0; i < partSubCatListKeys.length; i++ ) {
    
        console.log( 'load ' +  partSubCatListKeys[ i ]);
        
        ( function( i ) {
        
            var subCat = partSubCatList[ partSubCatListKeys[ i ] ];        

            // var promise = loadAsinc( '.' + subCat.path );
            var promise = loadAsinc( subCat.path );
            promise.then( function( skillsOriginalList) {

                subCat.listOriginal = skillsOriginalList;
                SkillsModification( subCat );

                SaveSkills( subCat );
    
            }, function( err ) {
    
                console.log(' thmsng wrong during loading resource');
    
            } );
            
        } )( i );
    }
    
    function SaveSkills( subCat ) {

        var fs = require('fs');
        // fs.writeFile( '.' + subCat.path, JSON.stringify( subCat.listOriginal ), function( err ) {
        fs.writeFile( subCat.path, JSON.stringify( subCat.listOriginal ), function( err ) {
                    
            if( err )
                console.log( 'Error! Smth wrong durind saving file ' + subCat.path );
            } );
                
        }

}

function SkillsModification( subCat ) {

     
        for( var j =  0; j < subCat.listChange.length; j++ ) {
        
            var skillChange = subCat.listChange[ j ];
            var skillOriginal;
            
            console.log( 'mod ' + skillChange.skill );
            
            switch( skillChange.skill ) {
            
                case "ANY":
                    
                    skillOriginal = subCat.listOriginal;
                    for( var i = 0; i < skillOriginal.length; i++ ) {
                    
                        console.log('before changing ' + skillOriginal[ i ].skill );
                        ChangeContent( skillOriginal[ i ], skillChange.content );
                        console.log('after changing ' + skillOriginal[ i ].skill );
                    
                    }
                
                break;
                
                default:
                
                    skillOriginal = subCat.listOriginal[ IndexOfSkill( subCat.listOriginal, skillChange.skill ) ];
            
                    ChangeContent( skillOriginal, skillChange.content );
                
                break;
            
            }
            
            
        
        }

}

function ChangeContent( prev, next ) {
        
        console.log( 'changing ' + prev.skill );
        
        prev.skill = next.skill || prev.skill;
        prev.price = next.price || prev.price;
        prev.description = next.description || prev.description;
        
        if( next.stats !== undefined ) {
        
            if( next.stats.statControl !== undefined ) ChangeStats( prev.stats.statControl, next.stats.statControl );
            
            if( next.stats.statUse !== undefined ) ChangeStats( prev.stats.statUse, next.stats.statUse );
            
            if( next.stats.statAffect !== undefined ) ChangeStats( prev.stats.statAffect, next.stats.statAffect );
        
        }
        
        function ChangeStats( prevStatCat, nextStatCat ) {
        
            var prev = prevStatCat;
            var next = nextStatCat;
                
            for( stat in next ) {
                    
                if( next[ stat ] === 'delete' ) {
                    
                    delete prev[ stat ];
                    
                } else {
                
                    switch( next[ stat ].statChangeType ) {
                    
                        case "EXPAND":
                            
                            if( prev[ stat ] === undefined ) prev[ stat ] = [];
                            prev[ stat ] = prev[ stat ].concat( next[ stat ].statContent );
                            
                        break;
                    
                        default:
                            prev[ stat ] = next[ stat ];
                        break;
                    }
                    
                    
                    
                }
            }
        
        }

}

function IndexOfSC( subCatList, subCategory ) {

    for( var i = 0; i < subCatList.length; i++ ) {
        
        if( subCatList[ i ].SubCategory === subCategory ) return i;
    
    }
    
    return -1;

}

function IndexOfSkill( skillsList, skill ) {

    for( var i = 0; i < skillsList.length; i++ ) {
    
        if( skillsList[i].skill === skill ) return i;
    
    }
    
    return -1;

}

function loadAsinc( source ) {

    var fs = require('fs');
    var deferred = q.defer();

    fs.readFile( source, {encoding: 'UTF-8'}, function( err, rawData ) {
    
        if( err ) {
        
            console.log( 'error loading ' + source );
            deferred.reject( err );
        
        } else {
        
            deferred.resolve( JSON.parse( rawData ) );
        
        }
        
    } );  

    return deferred.promise;    

}
    
var particularSkills = [
    {
        subCategory: "Физическая подготовка",
        skill: "Путь Атлета (пассивная способность)",
        content: {
            stats: {
        
                statControl: {                                
                    
                    "1006": {
                    
                        statChangeType: "EXPAND",
                        statContent: [
                        
                            {
                            
                                "subCategoryId":37,"skillId": 1
                            
                            }
                        
                        ]
                    
                    }
            
                }
        
            }
            
        }
    }
];

//приклади заявок на зміну властивотей

//пуста заявка
var appl_blank = [

    {
    
        //область заявки, яка ідентифікує здібність, в якій необхідно зробити зміни
        subCategory: "*імя підкатегорії*",
        //якщо в полі *назва здібності* вказане значення "ANY", то зміна відбуватиметься для всіх здібностей підкатегорії
        skill: "*імя здібності*",
        description: "*опис здібності*",
        //content - область заявки, яка визначає, які поля здібності будуть змінені і на які значення
        content: {
        
            price: "*ціна здібності*",
            skill: "*назва здібності*",
        
            stats: {
            
                statControl: {
                
                    "*ідентифікатор стату*": //пісял ідентифікатора йде масив, що містить здібності, що входять до стату.
                    //ящко замість масиву слоїть значення "delete", то вмість стату будет повністю видалено
                    [
                    
                        //
                        {
                            //спосіб вненесення змін до стату. По замовчуванню вміст стату повністю замінюється на новий.
                            //при наявності "EXPAND" новий вміт додаватиметься до існюючого
                            //при роботі по замовчуванню конструкцію statChangeType i statContent необхідно пропускати
                            statChangeType: "EXPAND",
                            statContent: [
                            
                                {
                                                        
                                    //за відсутності необхідності вказання типу конструкцію type i list необхідно пропускати
                                    type: "*тип списку для обробки: OR, AND, NOT*",
                                    list: [
                                    
                                        {
                                        
                                            subCategoryId: "**",
                                            skillId: "**"
                                        
                                        }
                                    
                                    ]
                                }
                            
                            ]
                        
                        }
                    
                    ]
                
                },
                statAffect: {                
                },
                statUse: {
                }
            
            }
        
        }
    
    }

];