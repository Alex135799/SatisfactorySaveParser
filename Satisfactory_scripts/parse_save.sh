#!/bin/bash

ORIG_SAVE_FILE_NAME='/mnt/c/Users/Alex/AppData/Local/FactoryGame/Saved/SaveGames/76561198129052250/Post Copper.sav'
SAVE_FILE_NAME='save_file.sav'
READ_INSTRUCTIONS='./read_instructions.csv'
LAYER_FILE_NAME='unzipped.txt'

endian() {
    if [ -t 0 ]; then exit; fi

    v=`cat /dev/stdin`
    i=${#v}

    while [ $i -gt 0 ]
    do
        i=$[$i-2]
        echo -n ${v:$i:2}
    done
}

readInt() {
    currentIndex=$1
    int_hex=`xxd -p -u -l 4 -s $currentIndex "$SAVE_FILE_NAME" | endian`
    int=`echo "ibase=16; $int_hex" | bc`
    echo $int
}

readByte() {
    currentIndex=$1
    int_hex=`xxd -p -u -l 1 -s $currentIndex "$SAVE_FILE_NAME" | endian`
    int=`echo "ibase=16; $int_hex" | bc`
    echo $int
}

readLong() {
    currentIndex=$1
    int_hex=`xxd -p -u -l 8 -s $currentIndex "$SAVE_FILE_NAME" | endian`
    int=`echo "ibase=16; $int_hex" | bc`
    echo $int
}

readString() {
    currentIndex=$1
    stringLength=`readInt $currentIndex`
    if [[ $stringLength -gt 2147483647 ]]; then
        echo "FUCK!!"
        exit 69
    fi
    ((currentIndex+=4))
    if [[ $stringLength -eq 0 ]]; then
        echo "$currentIndex \"\""
        return 0
    fi
    ((stringLength--))
    str_hex=`xxd -p -u -l $stringLength -s $currentIndex "$SAVE_FILE_NAME"`
    str=`echo $str_hex | xxd -r -p`
    ((currentIndex+=stringLength))
    ((currentIndex++))
    echo "$currentIndex $str"
}

currentIndex=0
OLDIFS=$IFS
IFS=','
while read name type
do
    if [ -z "$type" ]; then
        echo ""
        echo "-----$name-----"
    elif [ "$type" == "int" ]; then
        num=`readInt $currentIndex`
        ((currentIndex+=4))
        if [ "$name" == "compressed_size" ]; then
            compressed_size=$num
        fi
        echo "$name = $num"
    elif [ "$type" == "long" ]; then
        num=`readLong $currentIndex`
        ((currentIndex+=8))
        echo "$name = $num"
    elif [ "$type" == "byte" ]; then
        num=`readByte $currentIndex`
        ((currentIndex+=1))
        echo "$name = $num"
    elif [ "$type" == "string" ]; then
        str_return=`readString $currentIndex`
        currentIndex=`echo $str_return | cut -d ' ' -f1`
        str=`echo $str_return | cut -d ' ' -f2-`
        echo "$name = $str"
    fi
    #if [ "$name" == "Level" ]; then
        #str_hex=`xxd -p -u -l 100 -s $currentIndex "$SAVE_FILE_NAME"`
        #((currentIndex+=1))
        #echo "$str_hex"
    #fi
    if [ "$name" == "SaveFileBody" ]; then
        echo $compressed_size
        {
            head -c $currentIndex > first_part.txt
            head -c $compressed_size > compressed_part.zlib
        } < $SAVE_FILE_NAME
        rm first_part.txt
        zlib-flate -uncompress < compressed_part.zlib > $LAYER_FILE_NAME
        rm compressed_part.zlib
        SAVE_FILE_NAME=$LAYER_FILE_NAME
    fi
done < $READ_INSTRUCTIONS
#rm $LAYER_FILE_NAME
IFS=$OLDIFS